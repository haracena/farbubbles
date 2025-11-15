import { Token } from '@/interfaces/Token'
import { mockTokens } from '@/mock/tokens'
import { ArrowDownUp, Loader, Maximize } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { useTokenBalance } from '@/hooks/useTokenBalances'
import { useDebounce } from '@uidotdev/usehooks'
import { parseUnits, formatUnits, erc20Abi } from 'viem'
import ApproveOrReviewButton from './ApproveOrReviewButton'

interface SwapProps {
  selectedToken: Token
  onClose?: () => void
}
export default function Swap({ selectedToken, onClose }: SwapProps) {
  const [sellToken, setSellToken] = useState({
    id: 0, // o el siguiente ID disponible
    symbol: 'USDC',
    name: 'USD Coin',
    price: 1.0, // USDC es un stablecoin, siempre cerca de $1
    change24h: 0.0, // Los stablecoins suelen tener cambio mínimo
    marketCap: 28000000000000, // Market cap aproximado de USDC total
    volume24h: 8000000000, // Volumen 24h aproximado
    iconUrl:
      'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1696501939',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`, // USDC en Base
  })
  const [buyToken, setBuyToken] = useState(selectedToken)
  const [rotateChangeButton, setRotateChangeButton] = useState(0)
  const [sellAmount, setSellAmount] = useState('')
  const [buyAmount, setBuyAmount] = useState('')
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [price, setPrice] = useState<any>(null)
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
  const { balance: sellTokenBalance, isLoading: isLoadingSellBalance } =
    useTokenBalance(sellToken)
  const { balance: buyTokenBalance, isLoading: isLoadingBuyBalance } =
    useTokenBalance(buyToken)

  // Debounce del sellAmount
  const debouncedSellAmount = useDebounce(sellAmount, 600)
  // Ref para cancelar fetches en curso
  const abortControllerRef = useRef<AbortController | null>(null)

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
          // Limitar a 6 decimales y remover ceros al final
          const formatted = parseFloat(buyAmountFormatted)
            .toFixed(6)
            .replace(/\.?0+$/, '')
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
  ])

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
    const tempToken = sellToken
    setSellToken(buyToken)
    setBuyToken(tempToken)

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
      <div className="relative rounded-lg border border-white/20 bg-white/10 p-2 shadow-md backdrop-blur-md">
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
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src={sellToken.iconUrl}
              alt="logo"
              className="size-8 rounded-full"
            />
            <span className="font-regular text-2xl">{sellToken.symbol}</span>
          </div>
          <input
            className={`w-full text-end text-3xl font-medium focus:outline-none ${sellTokenBalance && sellAmount && parseFloat(sellAmount) > parseFloat(sellTokenBalance.formatted) ? 'text-red-400' : 'text-neutral-100'}`}
            type="text"
            placeholder="0.00"
            value={sellAmount}
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
                : sellTokenBalance?.formatted || '0.00'}
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
        className="botom-0 relative left-1/2 z-20 -mt-5 w-fit -translate-x-1/2 cursor-pointer rounded-lg border border-white/20 bg-neutral-700/90 p-2 shadow-md backdrop-blur-md"
      >
        {isLoadingPrice ? (
          <Loader className="size-4 animate-spin text-white duration-300" />
        ) : (
          <ArrowDownUp
            className={`size-4 text-white transition-transform duration-300 ease-in-out ${rotateChangeButton === 180 ? 'rotate-180' : 'rotate-0'}`}
          />
        )}
      </div>
      <div className="relative -mt-5 rounded-lg border border-white/20 bg-white/10 p-2 shadow-md backdrop-blur-md">
        <p className="mb-2 text-xs text-neutral-300">You receive</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src={buyToken.iconUrl}
              alt="logo"
              className="size-8 rounded-full"
            />
            <span className="font-regular text-2xl">{buyToken.symbol}</span>
          </div>
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
                : buyTokenBalance?.formatted || '0.00'}
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

      <div className="display flex items-center text-xs text-neutral-300">
        <p>0.3% swap fee</p>
        {/* <p>0.15% 0x fees</p> */}
        {/* <p>0.15% platform fees</p> */}
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
        ) : price ? (
          <ApproveOrReviewButton
            price={price}
            sellTokenAddress={
              sellToken.address || '0x0000000000000000000000000000000000000000'
            }
            taker={address || '0x0000000000000000000000000000000000000000'}
            onClick={() => {}}
          />
        ) : (
          <button
            className="rounded-lg bg-blue-500 p-2 text-white"
            disabled={true}
          >
            Review Trade
          </button>
        )}
      </div>
    </div>
  )
}
