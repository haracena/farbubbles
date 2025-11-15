import { Loader } from 'lucide-react'
import { useEffect } from 'react'
import { Address, erc20Abi, maxUint256 } from 'viem'
import {
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

interface PriceResponse {
  issues?: {
    allowance?: {
      spender?: Address
    } | null
  }
  [key: string]: unknown
}

interface ApproveOrReviewButtonProps {
  taker: Address
  onClick: () => void
  sellTokenAddress: Address
  disabled?: boolean
  price: PriceResponse | null
  isLoading: boolean
}

export default function ApproveOrReviewButton({
  taker,
  onClick,
  sellTokenAddress,
  disabled,
  price,
  isLoading,
}: ApproveOrReviewButtonProps) {
  // Determine the spender from price.issues.allowance
  const spender = (price?.issues?.allowance as { spender?: Address } | null)
    ?.spender
  console.log('spender', spender)

  // 1. Read from erc20, check approval for the determined spender to spend sellToken
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [taker, spender!],
    query: {
      enabled: !!sellTokenAddress && !!taker && !!spender,
      refetchInterval: false, // No refetch automático, solo manual
    },
  })

  // 2. (only if no allowance): write to erc20, approve token allowance for the determined spender
  useSimulateContract({
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender!, maxUint256],
    query: {
      enabled: !!sellTokenAddress && !!taker && !!spender,
    },
  })

  // Define useWriteContract for the 'approve' operation
  const { data: writeContractResult, writeContractAsync: writeContract } =
    useWriteContract()

  // useWaitForTransactionReceipt to wait for the approval transaction to complete
  const { data: approvalReceiptData, isLoading: isApproving } =
    useWaitForTransactionReceipt({
      hash: writeContractResult,
      query: {
        enabled: !!writeContractResult,
      },
    })

  // Call `refetch` when the transaction succeeds
  useEffect(() => {
    if (approvalReceiptData && writeContractResult) {
      console.log('Approval transaction confirmed, refetching allowance')
      // Esperar un poco para asegurarse de que el estado on-chain se actualizó
      setTimeout(() => {
        refetchAllowance()
      }, 1000)
    }
  }, [approvalReceiptData, writeContractResult, refetchAllowance])

  // If price.issues.allowance is null/undefined, no approval needed (native ETH or already handled)
  const allowanceIssue = price?.issues?.allowance
  if (allowanceIssue === null || allowanceIssue === undefined) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 p-2 text-white disabled:opacity-50"
      >
        {isLoading && <Loader className="size-4 animate-spin" />}
        {isLoading ? 'Loading...' : 'Review Trade'}
      </button>
    )
  }

  // if (error) {
  //   console.error('Error:', error)
  //   return (
  //     <button
  //       type="button"
  //       className="w-full rounded-lg bg-red-500 p-2 text-white"
  //     >
  //       Error
  //     </button>
  //   )
  // }

  // If allowance is 0 or undefined and we have a spender, show Approve button
  if (allowance === BigInt(0) || allowance === undefined) {
    return (
      <button
        type="button"
        disabled={isApproving || !spender}
        className="w-full rounded-lg bg-blue-500 p-2 text-white disabled:opacity-50"
        onClick={async () => {
          if (!spender) return
          try {
            await writeContract({
              abi: erc20Abi,
              address: sellTokenAddress,
              functionName: 'approve',
              args: [spender, maxUint256],
            })
            console.log(
              'Approval transaction sent, waiting for confirmation...',
            )
            // No refetch aquí, esperaremos a que useWaitForTransactionReceipt lo haga
          } catch (error) {
            console.error('Error approving token:', error)
          }
        }}
      >
        {isApproving ? 'Approving…' : 'Approve'}
      </button>
    )
  }

  // If already approved, show Review Trade button
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-lg bg-blue-500 p-2 text-white disabled:opacity-50"
    >
      Review Trade
    </button>
  )
}
