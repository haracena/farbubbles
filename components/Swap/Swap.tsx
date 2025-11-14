import { Token } from '@/interfaces/Token'
import { mockTokens } from '@/mock/tokens'
import { ArrowDownUp } from 'lucide-react'

interface SwapProps {
  selectedToken: Token
}
export default function Swap({ selectedToken }: SwapProps) {
  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="relative rounded-lg border border-white/20 bg-white/10 p-2 shadow-md backdrop-blur-md">
        <p className="mb-2 text-xs text-neutral-300">You pay</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src={mockTokens[1].iconUrl}
              alt="logo"
              className="size-8 rounded-full"
            />
            <span className="font-regular text-2xl">
              {mockTokens[1].symbol}
            </span>
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
      <div className="botom-0 relative left-1/2 z-20 -mt-4 w-fit -translate-x-1/2 rounded-lg border border-white/20 bg-neutral-700/90 p-2 shadow-md backdrop-blur-md">
        <ArrowDownUp className="size-4 text-white" />
      </div>
      <div className="relative -mt-4 rounded-lg border border-white/20 bg-white/10 p-2 shadow-md backdrop-blur-md">
        <p className="mb-2 text-xs text-neutral-300">You receive</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src={selectedToken.iconUrl}
              alt="logo"
              className="size-8 rounded-full"
            />
            <span className="font-regular text-2xl">
              {selectedToken.symbol}
            </span>
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
