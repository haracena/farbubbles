import { Token } from '@/interfaces/Token'
import { ArrowDownUp, Loader } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import {
  useAccount,
  useConnect,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { useTokenBalance } from '@/hooks/useTokenBalances'
import { useDebounce } from '@uidotdev/usehooks'
import { parseUnits, formatUnits, Address } from 'viem'
import { toast } from 'sonner'
import ApproveOrReviewButton from './ApproveOrReviewButton'
import SwapReview from './SwapReview'
import { formatAmount } from '@/lib/helpers'
import TokenSelector from './TokenSelector'
import { mockTokens } from '@/mock/tokens'
import { ChevronDown } from 'lucide-react'

interface SwapProps {
  selectedToken: Token
  onTokenChange?: (token: Token) => void
  onClose?: () => void
}
export default function Swap({
  selectedToken,
  onTokenChange,
  onClose,
}: SwapProps) {
  const [sellToken, setSellToken] = useState<Token>({
    id: 'usdc-0000-0000-0000-000000000000',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC en Base
    chain: 8453,
    name: 'USD Coin',
    symbol: 'USDC',
    price: 1.0, // USDC es un stablecoin, siempre cerca de $1
    marketCap: 28000000000000, // Market cap aproximado de USDC total
    volume24h: 8000000000, // Volumen 24h aproximado
    liquidity: 28000000000000,
    holders: null,
    change: {
      '1h': null,
      '24h': 0.0, // Los stablecoins suelen tener cambio mínimo
      '7d': null,
    },
    image:
      'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1696501939',
    deployedAt: '2023-01-01T00:00:00.000Z',
  })
  const [buyToken, setBuyToken] = useState(selectedToken)
  const [rotateChangeButton, setRotateChangeButton] = useState(0)
  const [sellAmount, setSellAmount] = useState('')
  const [buyAmount, setBuyAmount] = useState('')
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [price, setPrice] = useState<Record<string, unknown> | null>(null)
  const [quote, setQuote] = useState<Record<string, unknown> | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [showTokenSelector, setShowTokenSelector] = useState(false)
  const [showBuyTokenSelector, setShowBuyTokenSelector] = useState(false)
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()

  // Send transaction hook for executing swap
  const { data: swapHash, sendTransactionAsync } = useSendTransaction()

  // Wait for swap transaction receipt
  const {
    data: swapReceipt,
    isLoading: isExecutingSwap,
    error: swapError,
    isError: isSwapError,
  } = useWaitForTransactionReceipt({
    hash: swapHash,
  })
  const { balance: sellTokenBalance, isLoading: isLoadingSellBalance } =
    useTokenBalance(sellToken)
  const { balance: buyTokenBalance, isLoading: isLoadingBuyBalance } =
    useTokenBalance(buyToken)

  // Debounce del sellAmount
  const debouncedSellAmount = useDebounce(sellAmount, 600)
  // Ref para cancelar fetches en curso
  const abortControllerRef = useRef<AbortController | null>(null)
  // Ref para rastrear si ya se mostró el toast de éxito para un receipt específico
  const processedReceiptRef = useRef<string | null>(null)
  // Ref para guardar los valores del swap cuando se envía la transacción
  const swapValuesRef = useRef<{
    sellAmount: string
    buyAmount: string
    sellTokenSymbol: string
    buyTokenSymbol: string
  } | null>(null)

  // Consultar precio cuando cambie el valor debounced o los tokens
  useEffect(() => {
    // Cancelar cualquier fetch anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const fetchPrice = async () => {
      // Crear nuevo AbortController para este fetch
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      if (
        !debouncedSellAmount ||
        parseFloat(debouncedSellAmount) <= 0 ||
        !sellToken.address ||
        !buyToken.address
      ) {
        setBuyAmount('')
        setIsLoadingPrice(false)
        return
      }

      setIsLoadingPrice(true)
      try {
        // Convertir el sellAmount a wei (usando 18 decimales por defecto, o los decimales del token si están disponibles)
        const sellTokenDecimals = sellTokenBalance?.decimals || 18
        let sellAmountInWei
        try {
          sellAmountInWei = parseUnits(debouncedSellAmount, sellTokenDecimals)
        } catch {
          // Si falla la conversión (número inválido), limpiar el buyAmount
          setBuyAmount('')
          setIsLoadingPrice(false)
          return
        }

        const params = new URLSearchParams({
          chainId: '8453', // Base chain
          buyToken: buyToken.address,
          sellToken: sellToken.address,
          sellAmount: sellAmountInWei.toString(),
        })

        if (address) {
          params.append('taker', address)
        }

        const response = await fetch(`/api/token/price?${params.toString()}`, {
          signal,
        })

        // Verificar si el fetch fue cancelado
        if (signal.aborted) {
          return
        }

        const data = await response.json()
        console.log(data)

        if (data.buyAmount) {
          // Convertir de wei a unidades normales (usando los decimales del buyToken)
          const buyTokenDecimals = buyTokenBalance?.decimals || 18
          const buyAmountBigInt = BigInt(data.buyAmount)
          const buyAmountFormatted = formatUnits(
            buyAmountBigInt,
            buyTokenDecimals,
          )

          const formatted = formatAmount(buyAmountFormatted)
          setBuyAmount(formatted)
          setPrice(data)
        } else {
          setBuyAmount('')
        }
      } catch (error) {
        // Ignorar errores de cancelación (AbortError)
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }
        console.error('Error fetching price:', error)
        setBuyAmount('')
        setIsLoadingPrice(false)
      } finally {
        // Solo actualizar loading si no fue cancelado
        if (!signal.aborted) {
          setIsLoadingPrice(false)
        }
      }
    }

    fetchPrice()

    // Cleanup: cancelar fetch si el componente se desmonta o las dependencias cambian
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      // Asegurarse de resetear el loading cuando se cancela
      setIsLoadingPrice(false)
    }
  }, [
    debouncedSellAmount,
    sellToken.address,
    buyToken.address,
    sellTokenBalance?.decimals,
    buyTokenBalance?.decimals,
    address,
  ])

  // Fetch quote function
  const fetchQuote = async () => {
    if (!sellToken.address || !buyToken.address || !sellAmount || !address) {
      return
    }

    setIsLoadingQuote(true)

    try {
      const sellTokenDecimals = sellTokenBalance?.decimals || 18
      const sellAmountInWei = parseUnits(sellAmount, sellTokenDecimals)

      const params = new URLSearchParams({
        chainId: '8453',
        buyToken: buyToken.address,
        sellToken: sellToken.address,
        sellAmount: sellAmountInWei.toString(),
        taker: address,
      })

      const response = await fetch(`/api/token/quote?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch quote:', {
          status: response.status,
          error: errorData,
        })
        toast.error('Failed to get quote', {
          description: 'Unable to fetch swap quote. Please try again.',
        })
        return
      }

      const data = await response.json()

      console.log('Quote response:', data)

      if (data.error) {
        console.error('Quote API error:', data.error, data.details)
        toast.error('Quote error', {
          description: 'Failed to get quote. Please try again.',
        })
        return
      }

      if (data.validationErrors && data.validationErrors.length > 0) {
        console.error('Quote validation errors:', data.validationErrors)
        toast.error('Invalid quote', {
          description: 'Quote validation failed. Please check your inputs.',
        })
        return
      }

      // La API de 0x devuelve to y data dentro de transaction
      if (!data.transaction || !data.transaction.to || !data.transaction.data) {
        console.error('Quote missing required fields:', {
          transaction: data.transaction,
          to: data.transaction?.to,
          data: data.transaction?.data,
          fullResponse: data,
          availableKeys: Object.keys(data),
        })
        toast.error('Invalid quote', {
          description: 'Quote data is incomplete. Please try again.',
        })
        return
      }

      setQuote(data)
      setShowReview(true)
    } catch (error) {
      console.error('Error fetching quote:', error)
      toast.error('Error fetching quote', {
        description: 'Failed to fetch quote. Please try again.',
      })
    } finally {
      setIsLoadingQuote(false)
    }
  }

  // Execute swap function
  const executeSwap = async () => {
    console.log('Executing swap with quote:', quote)

    if (!quote) {
      console.error('No quote available')
      toast.error('Error', {
        description: 'No quote available. Please try again.',
      })
      return
    }

    // La API de 0x devuelve to, data y value dentro de transaction
    const transaction = quote.transaction as
      | {
          to?: string
          data?: string
          value?: string
          gas?: string
        }
      | undefined

    if (!transaction) {
      console.error('Quote missing transaction object')
      toast.error('Error', {
        description: 'Invalid quote data. Please try again.',
      })
      return
    }

    const quoteTo = transaction.to
    const quoteData = transaction.data
    const quoteValue = transaction.value

    console.log('Quote values:', {
      to: quoteTo,
      data: quoteData ? `${quoteData.substring(0, 20)}...` : 'missing',
      value: quoteValue,
    })

    if (!quoteTo || !quoteData) {
      console.error('Invalid quote data - missing to or data:', {
        to: quoteTo,
        data: quoteData,
        transactionKeys: Object.keys(transaction),
      })
      toast.error('Error', {
        description: 'Invalid transaction data. Please try again.',
      })
      return
    }

    try {
      const value = quoteValue ? BigInt(quoteValue) : BigInt(0)

      console.log('Sending transaction:', {
        to: quoteTo,
        dataLength: quoteData.length,
        value: value.toString(),
      })

      // Guardar los valores del swap antes de enviar la transacción
      swapValuesRef.current = {
        sellAmount,
        buyAmount,
        sellTokenSymbol: sellToken.symbol,
        buyTokenSymbol: buyToken.symbol,
      }

      await sendTransactionAsync({
        to: quoteTo as Address,
        data: quoteData as `0x${string}`,
        value,
      })

      // Cerrar modal
      setShowReview(false)

      // Mostrar toast de confirmación en progreso
      toast.info('Transaction submitted', {
        description: 'Waiting for confirmation on the blockchain...',
      })
    } catch (error) {
      console.error('Error executing swap:', error)
      toast.error('Transaction failed', {
        description: 'Failed to execute swap. Please try again.',
      })
    }
  }

  // Handle swap success
  useEffect(() => {
    if (swapReceipt) {
      // Crear una clave única para este receipt
      const receiptKey = `${swapReceipt.transactionHash}-${swapReceipt.status}`

      // Verificar si ya procesamos este receipt
      if (processedReceiptRef.current === receiptKey) {
        return
      }

      // Marcar este receipt como procesado
      processedReceiptRef.current = receiptKey

      // Verificar si la transacción fue exitosa
      if (swapReceipt.status === 'success') {
        console.log('Swap executed successfully:', swapReceipt)

        // Usar los valores guardados al momento del swap
        const values = swapValuesRef.current
        if (values) {
          // Mostrar toast de éxito
          toast.success('Swap completed!', {
            description: `Successfully swapped ${formatAmount(values.sellAmount)} ${values.sellTokenSymbol} for ${formatAmount(values.buyAmount)} ${values.buyTokenSymbol}`,
            duration: 5000,
          })
        }

        // Reset form
        setSellAmount('')
        setBuyAmount('')
        setQuote(null)
        setPrice(null)
        swapValuesRef.current = null
      } else if (swapReceipt.status === 'reverted') {
        // La transacción fue revertida
        toast.error('Transaction failed', {
          description: 'The swap transaction was reverted. Please try again.',
          duration: 5000,
        })
      }
    }
  }, [swapReceipt])

  // Handle swap error (solo si NO hay un receipt exitoso)
  useEffect(() => {
    // Solo mostrar error si:
    // 1. Hay un error
    // 2. NO hay un receipt exitoso (o el receipt no es success)
    // 3. Tenemos un swapHash (para evitar errores de otros estados)
    if (
      isSwapError &&
      swapError &&
      swapHash &&
      (!swapReceipt || swapReceipt.status !== 'success')
    ) {
      // Crear una clave única para este error basada en el hash de la transacción
      const errorKey = `error-${swapHash}`

      // Verificar si ya procesamos este error o si ya tenemos un receipt exitoso
      if (
        processedReceiptRef.current === errorKey ||
        processedReceiptRef.current?.includes(swapHash)
      ) {
        return
      }

      // Marcar este error como procesado
      processedReceiptRef.current = errorKey

      console.error('Swap transaction error:', swapError)
      toast.error('Transaction error', {
        description: 'Transaction failed. Please try again.',
        duration: 5000,
      })
    }
  }, [isSwapError, swapError, swapHash, swapReceipt])

  const handleChangeButtonClick = () => {
    // Cancelar cualquier fetch en curso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Limpiar las cantidades PRIMERO antes de cambiar los tokens
    // Esto asegura que el debounce también se resetee
    setSellAmount('')
    setBuyAmount('')
    setIsLoadingPrice(false)

    // Intercambiar tokens
    const tempSellToken = sellToken
    setSellToken({
      ...buyToken,
    })
    setBuyToken({
      ...tempSellToken,
    })

    // Notificar al padre (BubbleModal) del nuevo buyToken
    // Solo si NO es un stablecoin
    const isStablecoin = ['USDC', 'USDT', 'DAI', 'BUSD'].includes(
      tempSellToken.symbol,
    )
    if (!isStablecoin) {
      onTokenChange?.(tempSellToken)
    }

    // Actualizar el botón de rotación
    setRotateChangeButton((prev) => {
      if (prev === 0) {
        return 180
      }
      return 0
    })
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="relative rounded-lg border border-white/20 bg-white/10 p-2 shadow-md">
        <div className="flex items-center justify-between">
          <p className="mb-2 text-xs text-neutral-300">You pay</p>
          <button
            onClick={() => {
              setSellAmount(sellTokenBalance?.formatted || '0.00')
            }}
            className="cursor-pointer text-xs text-neutral-300 transition-colors duration-300 hover:text-neutral-50"
          >
            Max
          </button>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <button
            onClick={() => setShowTokenSelector(true)}
            className="flex items-center gap-2 rounded-full bg-white/5 p-1 transition-colors"
          >
            <img
              src={sellToken.image}
              alt="logo"
              className="size-8 rounded-full object-cover"
            />
            <span
              className={`font-regular ${sellToken.symbol.length > 5 ? 'text-lg' : 'text-xl'}`}
            >
              {sellToken.symbol}
            </span>
            <ChevronDown className="size-4 -translate-x-1 text-neutral-100" />
          </button>
          <input
            className={`w-full text-end text-3xl font-medium focus:outline-none ${sellTokenBalance && sellAmount && parseFloat(sellAmount) > parseFloat(sellTokenBalance.formatted) ? 'text-red-400' : 'text-neutral-100'}`}
            type="text"
            inputMode="decimal"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder="0.00"
            value={sellAmount}
            disabled={!address}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, '')
              setSellAmount(value)
            }}
          />
        </div>
        <div className="mt-2 flex items-center gap-1">
          <p className="text-sm text-neutral-300">
            Balance:{' '}
            <span
              onClick={() => {
                setSellAmount(sellTokenBalance?.formatted || '0.00')
              }}
              className="cursor-pointer text-neutral-100 transition-colors duration-300 hover:text-neutral-50"
            >
              {isLoadingSellBalance
                ? '...'
                : formatAmount(sellTokenBalance?.formatted || '0.00')}
            </span>
          </p>
          {sellTokenBalance &&
          sellAmount &&
          parseFloat(sellAmount) > parseFloat(sellTokenBalance.formatted) ? (
            <p className="ml-auto text-xs text-red-400">Insufficient balance</p>
          ) : null}
          {/* {sellTokenBalance && sellToken.price && (
            <p className="-mb-[2px] text-xs text-neutral-300">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 2,
              }).format(
                parseFloat(sellTokenBalance.formatted) * sellToken.price,
              )}
            </p>
          )} */}
        </div>
      </div>
      <div
        onClick={handleChangeButtonClick}
        className="botom-0 relative left-1/2 z-20 -mt-5 w-fit -translate-x-1/2 cursor-pointer rounded-lg border border-white/20 bg-neutral-700/90 p-2 shadow-md"
      >
        {isLoadingPrice ? (
          <Loader className="size-4 animate-spin text-white duration-300" />
        ) : (
          <ArrowDownUp
            className={`size-4 text-white transition-transform duration-300 ease-in-out ${rotateChangeButton === 180 ? 'rotate-180' : 'rotate-0'}`}
          />
        )}
      </div>
      <div className="relative -mt-5 rounded-lg border border-white/20 bg-white/10 p-2 shadow-md">
        <p className="mb-2 text-xs text-neutral-300">You receive</p>
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <button
            onClick={() => setShowBuyTokenSelector(true)}
            className="flex items-center gap-2 rounded-full bg-white/5 p-1 transition-colors"
          >
            <img
              src={buyToken.image}
              alt="logo"
              className="size-8 rounded-full object-cover"
            />
            <span
              className={`font-regular ${buyToken.symbol.length > 5 ? 'text-lg' : 'text-xl'}`}
            >
              {buyToken.symbol}
            </span>
            <ChevronDown className="size-4 -translate-x-1 text-neutral-100" />
          </button>
          <input
            className={`w-full text-end text-3xl font-medium focus:outline-none ${isLoadingPrice ? 'animate-pulse' : ''}`}
            type="text"
            placeholder="0.00"
            value={isLoadingPrice ? '...' : buyAmount}
            readOnly
          />
        </div>
        <div className="mt-2 flex items-center gap-1">
          <p className="text-sm text-neutral-300">
            Balance:{' '}
            <span className="text-neutral-100">
              {isLoadingBuyBalance
                ? '...'
                : formatAmount(buyTokenBalance?.formatted || '0.00')}
            </span>
          </p>
          {/* {buyTokenBalance && buyToken.price && (
            <p className="-mb-[2px] text-xs text-neutral-300">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 2,
              }).format(parseFloat(buyTokenBalance.formatted) * buyToken.price)}
            </p>
          )} */}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          onClick={() => onClose?.()}
          className="rounded-lg bg-neutral-700/90 p-2 text-white"
        >
          Close
        </button>
        {!isConnected ? (
          <button
            className="rounded-lg bg-blue-500 p-2 text-white"
            onClick={() => connect({ connector: connectors[0] })}
          >
            Connect
          </button>
        ) : price && address ? (
          <ApproveOrReviewButton
            price={price}
            sellTokenAddress={
              (sellToken.address ||
                '0x0000000000000000000000000000000000000000') as Address
            }
            taker={address}
            onClick={fetchQuote}
            isLoading={isLoadingQuote}
            disabled={
              isLoadingQuote ||
              !sellAmount ||
              parseFloat(sellAmount) <= 0 ||
              !!(
                sellTokenBalance &&
                parseFloat(sellAmount) > parseFloat(sellTokenBalance.formatted)
              )
            }
          />
        ) : (
          <button
            className="rounded-lg bg-blue-500 p-2 text-white disabled:opacity-50"
            disabled={true}
          >
            Review Trade
          </button>
        )}
      </div>

      {/* Swap Review Modal */}
      <SwapReview
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        onConfirm={executeSwap}
        quote={quote}
        sellToken={sellToken}
        buyToken={buyToken}
        sellAmount={sellAmount}
        buyAmount={buyAmount}
        isLoading={isExecutingSwap}
      />

      {/* Token Selector Modal */}
      <TokenSelector
        isOpen={showTokenSelector}
        onClose={() => setShowTokenSelector(false)}
        onSelectToken={(token) => {
          setSellToken(token)
          // Clear amounts when changing token
          setSellAmount('')
          setBuyAmount('')
        }}
        currentToken={sellToken}
        excludeToken={buyToken}
        availableTokens={mockTokens}
      />

      {/* Buy Token Selector Modal */}
      <TokenSelector
        isOpen={showBuyTokenSelector}
        onClose={() => setShowBuyTokenSelector(false)}
        onSelectToken={(token) => {
          setBuyToken(token)

          // Only update BubbleModal if NOT a stablecoin
          // This keeps the modal showing interesting Clanker tokens
          const isStablecoin = ['USDC', 'USDT', 'DAI', 'BUSD'].includes(
            token.symbol,
          )
          if (!isStablecoin) {
            onTokenChange?.(token)
          }

          // Clear amounts when changing token
          setSellAmount('')
          setBuyAmount('')
        }}
        currentToken={buyToken}
        excludeToken={sellToken}
        availableTokens={mockTokens}
      />
    </div>
  )
}
