import { Token } from '@/interfaces/Token'
import { mockTokens } from '@/mock/tokens'
import { ArrowDownUp, Loader } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { useTokenBalance } from '@/hooks/useTokenBalances'
import { useDebounce } from '@uidotdev/usehooks'
import { parseUnits, formatUnits } from 'viem'

interface SwapProps {
  selectedToken: Token
  onClose?: () => void
}
export default function Swap({ selectedToken, onClose }: SwapProps) {
  const [sellToken, setSellToken] = useState(mockTokens[1])
  const [buyToken, setBuyToken] = useState(selectedToken)
  const [rotateChangeButton, setRotateChangeButton] = useState(0)
  const [sellAmount, setSellAmount] = useState('')
  const [buyAmount, setBuyAmount] = useState('')
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { balance: sellTokenBalance, isLoading: isLoadingSellBalance } =
    useTokenBalance(sellToken)
  const { balance: buyTokenBalance, isLoading: isLoadingBuyBalance } =
    useTokenBalance(buyToken)

  // Debounce del sellAmount
  const debouncedSellAmount = useDebounce(sellAmount, 600)

  // Consultar precio cuando cambie el valor debounced o los tokens
  useEffect(() => {
    const fetchPrice = async () => {
      if (
        !debouncedSellAmount ||
        parseFloat(debouncedSellAmount) <= 0 ||
        !sellToken.address ||
        !buyToken.address
      ) {
        setBuyAmount('')
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

        const response = await fetch(`/api/token/price?${params.toString()}`)
        const data = await response.json()

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
        } else {
          setBuyAmount('')
        }
      } catch (error) {
        console.error('Error fetching price:', error)
        setBuyAmount('')
      } finally {
        setIsLoadingPrice(false)
      }
    }

    fetchPrice()
  }, [
    debouncedSellAmount,
    sellToken.address,
    buyToken.address,
    sellTokenBalance?.decimals,
    buyTokenBalance?.decimals,
  ])

  console.log(sellTokenBalance)
  console.log(buyTokenBalance)

  const handleChangeButtonClick = () => {
    setRotateChangeButton((prev) => {
      if (prev === 0) {
        return 180
      }
      return 0
    })
    // Intercambiar tokens
    const tempToken = sellToken
    setSellToken(buyToken)
    setBuyToken(tempToken)
    // Limpiar las cantidades al intercambiar
    setSellAmount('')
    setBuyAmount('')
  }
  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="relative rounded-lg border border-white/20 bg-white/10 p-2 shadow-md backdrop-blur-md">
        <p className="mb-2 text-xs text-neutral-300">You pay</p>
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
            className="w-full text-end text-3xl font-medium focus:outline-none"
            type="text"
            placeholder="0.00"
            value={sellAmount}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, '')
              setSellAmount(value)
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-neutral-300">
            Balance:{' '}
            <span className="text-neutral-100">
              {isLoadingSellBalance
                ? '...'
                : sellTokenBalance?.formatted || '0.00'}
            </span>
          </p>
          {sellTokenBalance && sellToken.price && (
            <p className="text-sm text-neutral-300">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 2,
              }).format(
                parseFloat(sellTokenBalance.formatted) * sellToken.price,
              )}
            </p>
          )}
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
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-neutral-300">
            Balance:{' '}
            <span className="text-neutral-100">
              {isLoadingBuyBalance
                ? '...'
                : buyTokenBalance?.formatted || '0.00'}
            </span>
          </p>
          {buyTokenBalance && buyToken.price && (
            <p className="text-sm text-neutral-300">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 2,
              }).format(parseFloat(buyTokenBalance.formatted) * buyToken.price)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onClose?.()}
          className="mt-2 rounded-lg bg-neutral-700/90 p-2 text-white"
        >
          Close
        </button>
        {!isConnected ? (
          <button
            className="mt-2 rounded-lg bg-blue-500 p-2 text-white"
            onClick={() => connect({ connector: connectors[0] })}
          >
            Connect
          </button>
        ) : (
          <button className="mt-2 rounded-lg bg-blue-500 p-2 text-white">
            Swap
          </button>
        )}
      </div>
    </div>
  )
}
