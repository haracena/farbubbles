import { Token } from '@/interfaces/Token'
import { mockTokens } from '@/mock/tokens'
import { ArrowDownUp } from 'lucide-react'
import { useState } from 'react'

interface SwapProps {
  selectedToken: Token
}
export default function Swap({ selectedToken }: SwapProps) {
  const [sellToken, setSellToken] = useState(mockTokens[1])
  const [buyToken, setBuyToken] = useState(selectedToken)
  const [rotateChangeButton, setRotateChangeButton] = useState(0)

  const handleChangeButtonClick = () => {
    setRotateChangeButton((prev) => {
      if (prev === 0) {
        return 180
      }
      return 0
    })
    setSellToken((prev) => (prev === sellToken ? buyToken : sellToken))
    setBuyToken((prev) => (prev === buyToken ? sellToken : buyToken))
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
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-neutral-300">
            Balance: <span className="text-neutral-100">100</span>
          </p>
          <p className="text-sm text-neutral-300">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 2,
            }).format(100)}
          </p>
        </div>
      </div>
      <div
        onClick={handleChangeButtonClick}
        className="botom-0 relative left-1/2 z-20 -mt-4 w-fit -translate-x-1/2 cursor-pointer rounded-lg border border-white/20 bg-neutral-700/90 p-2 shadow-md backdrop-blur-md"
      >
        <ArrowDownUp
          className={`size-4 text-white transition-transform duration-300 ease-in-out ${rotateChangeButton === 180 ? 'rotate-180' : 'rotate-0'}`}
        />
      </div>
      <div className="relative -mt-4 rounded-lg border border-white/20 bg-white/10 p-2 shadow-md backdrop-blur-md">
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
            className="w-full text-end text-3xl font-medium focus:outline-none"
            type="text"
            placeholder="0.00"
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-neutral-300">
            Balance: <span className="text-neutral-100">100</span>
          </p>
          <p className="text-sm text-neutral-300">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 2,
            }).format(100)}
          </p>
        </div>
      </div>
      <button className="mt-2 rounded-lg bg-blue-500 p-2 text-white">
        Swap
      </button>
    </div>
  )
}
