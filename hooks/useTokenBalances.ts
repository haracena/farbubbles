'use client'

import { useAccount, useBalance, useReadContracts } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'
import { Token } from '@/interfaces/Token'
import { useMemo } from 'react'

interface TokenBalance {
  token: Token
  balance: bigint
  formatted: string
  decimals: number
}

/**
 * Hook to fetch ERC20 token balances for the connected wallet
 * Uses batch reads for optimal performance
 */
export function useTokenBalances(tokens: Token[]) {
  const { address } = useAccount()

  // Filter tokens that have contract addresses
  const tokensWithAddresses = useMemo(
    () => tokens.filter((token) => token.address),
    [tokens],
  )

  // Prepare contract read configs for batch reading
  const contracts = useMemo(
    () =>
      tokensWithAddresses.map((token) => ({
        address: token.address!,
        abi: erc20Abi,
        functionName: 'balanceOf' as const,
        args: address ? [address] : undefined,
      })),
    [tokensWithAddresses, address],
  )

  // Batch read all balances
  const { data: balancesData, isLoading } = useReadContracts({
    contracts,
    query: {
      enabled: !!address && contracts.length > 0,
      refetchInterval: 10000, // Refetch every 10 seconds
      refetchOnWindowFocus: true, // Refetch when window regains focus
    },
  })

  // Also read decimals for each token (needed for formatting)
  const decimalsContracts = useMemo(
    () =>
      tokensWithAddresses.map((token) => ({
        address: token.address!,
        abi: erc20Abi,
        functionName: 'decimals' as const,
      })),
    [tokensWithAddresses],
  )

  const { data: decimalsData } = useReadContracts({
    contracts: decimalsContracts,
    query: {
      enabled: contracts.length > 0,
      // Decimals don't change, so no need to refetch
      staleTime: Infinity,
    },
  })

  // Combine results into a map for easy lookup
  const balancesMap = useMemo(() => {
    if (!balancesData || !decimalsData) return new Map<string, TokenBalance>()

    const map = new Map<string, TokenBalance>()

    tokensWithAddresses.forEach((token, index) => {
      const balanceResult = balancesData[index]
      const decimalsResult = decimalsData[index]

      if (
        balanceResult?.status === 'success' &&
        decimalsResult?.status === 'success'
      ) {
        const balance = balanceResult.result as bigint
        const decimals = decimalsResult.result as number
        const formatted = formatUnits(balance, decimals)

        map.set(token.address!.toLowerCase(), {
          token,
          balance,
          formatted,
          decimals,
        })
      }
    })

    return map
  }, [balancesData, decimalsData, tokensWithAddresses])

  return {
    balances: balancesMap,
    isLoading,
    hasBalances: balancesMap.size > 0,
  }
}

/**
 * Hook to get balance for a single token
 * For ETH native, uses useBalance (no contract address needed)
 * For ERC20 tokens, uses useReadContracts
 */
export function useTokenBalance(token: Token | undefined) {
  const { address } = useAccount()

  // ETH native doesn't have a contract address - it's the base currency
  // When symbol is ETH, we read native balance regardless of address field
  const isNativeETH = token?.symbol === 'ETH'

  // Use useBalance for native ETH
  const { data: nativeBalance, isLoading: isLoadingNative } = useBalance({
    address,
    query: {
      enabled: !!address && isNativeETH,
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    },
  })

  // Use useReadContracts for ERC20 tokens (not ETH)
  const { data: erc20Balance, isLoading: isLoadingERC20 } = useReadContracts({
    contracts:
      token?.address && !isNativeETH
        ? [
            {
              address: token.address,
              abi: erc20Abi,
              functionName: 'balanceOf' as const,
              args: address ? [address] : undefined,
            },
            {
              address: token.address,
              abi: erc20Abi,
              functionName: 'decimals' as const,
            },
          ]
        : [],
    query: {
      enabled: !!address && !!token?.address && !isNativeETH,
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    },
  })

  const result = useMemo(() => {
    // Helper function to format with max 6 decimals
    const formatWithMaxDecimals = (value: string): string => {
      const num = parseFloat(value)
      if (isNaN(num)) return value

      // Format to max 6 decimals and remove trailing zeros
      return num.toFixed(6).replace(/\.?0+$/, '')
    }

    // Handle native ETH
    if (isNativeETH && nativeBalance) {
      return {
        balance: nativeBalance.value,
        formatted: formatWithMaxDecimals(nativeBalance.formatted),
        decimals: 18, // ETH always has 18 decimals
      }
    }

    // Handle ERC20 tokens
    if (!isNativeETH && erc20Balance && erc20Balance.length >= 2) {
      const balanceResult = erc20Balance[0]
      const decimalsResult = erc20Balance[1]

      if (
        balanceResult?.status === 'success' &&
        decimalsResult?.status === 'success'
      ) {
        const balanceValue = balanceResult.result as bigint
        const decimals = decimalsResult.result as number
        const formatted = formatUnits(balanceValue, decimals)

        return {
          balance: balanceValue,
          formatted: formatWithMaxDecimals(formatted),
          decimals,
        }
      }
    }

    return null
  }, [isNativeETH, nativeBalance, erc20Balance])

  return {
    balance: result,
    isLoading: isLoadingNative || isLoadingERC20,
  }
}
