import { Token } from '@/interfaces/Token'
import Chart from '../Chart/Chart'
import Swap from '../Swap/Swap'
import { Dialog, DialogContent } from '../ui/dialog'
import { X, Loader } from 'lucide-react'
import { useTokenChartData } from '@/hooks/useTokenChartData'
import { useState } from 'react'

interface BubbleModalProps {
  selectedToken: Token
  onClose: () => void
}
export default function BubbleModal({
  selectedToken,
  onClose,
}: BubbleModalProps) {
  const [currentToken, setCurrentToken] = useState(selectedToken)

  const { data: chartData, isLoading: isLoadingChart } = useTokenChartData(
    currentToken.address || '',
  )

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="mt-0 w-[95vw] max-w-none space-y-3 rounded-lg border border-white/20 bg-neutral-800/95 p-4 text-white sm:rounded-lg">
        {/* <button onClick={onClose} className="absolute top-5 right-4">
        <X className="size-4" />
      </button> */}
        <button onClick={() => onClose()} className="absolute top-5 right-4">
          <X className="size-4" />
        </button>
        <div className="flex items-center gap-3">
          <img
            src={currentToken.image}
            alt={`${currentToken.symbol} icon`}
            className="size-12 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-bold">
              {currentToken.name} ({currentToken.symbol})
            </h3>

            <p className="text-sm opacity-80">
              {currentToken.price !== null
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: currentToken.price >= 1 ? 2 : 6,
                  }).format(currentToken.price)
                : 'N/A'}
              {currentToken.change['24h'] !== null && (
                <span
                  className={`ml-1 text-sm font-semibold ${
                    currentToken.change['24h'] >= 0
                      ? 'text-emerald-300'
                      : 'text-rose-300'
                  }`}
                >
                  {currentToken.change['24h'] >= 0 ? '+' : ''}
                  {currentToken.change['24h'].toFixed(2)}% (24h)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-4 text-xs opacity-75">
          {currentToken.marketCap !== null && (
            <p>
              Market cap:{' '}
              {new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 2,
              }).format(currentToken.marketCap)}
            </p>
          )}
          {currentToken.volume24h !== null && (
            <p>
              24h volume:{' '}
              {new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 2,
              }).format(currentToken.volume24h)}
            </p>
          )}
        </div>
        <div className="relative min-h-[200px]">
          {isLoadingChart && (
            <div className="absolute inset-0 z-10 flex animate-pulse items-center justify-center gap-1 bg-neutral-800/50">
              <Loader className="size-4 translate-y-px animate-spin text-neutral-500" />{' '}
              <span>Loading chart data</span>
            </div>
          )}
          {!isLoadingChart && chartData && chartData.length > 0 && (
            <Chart data={chartData} />
          )}
        </div>

        <Swap
          selectedToken={currentToken}
          onTokenChange={setCurrentToken}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
