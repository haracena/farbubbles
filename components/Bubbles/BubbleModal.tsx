import { Token } from '@/interfaces/Token'
import Chart from '../Chart/Chart'
import Swap from '../Swap/Swap'
import { Dialog, DialogContent } from '../ui/dialog'
import { X, LogOut } from 'lucide-react'
import { useDisconnect } from 'wagmi'

interface BubbleModalProps {
  selectedToken: Token
  onClose: () => void
}
export default function BubbleModal({
  selectedToken,
  onClose,
}: BubbleModalProps) {
  const { disconnect } = useDisconnect()
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="mt-0 w-[95vw] max-w-none space-y-3 rounded-lg border border-white/20 bg-neutral-800/90 p-4 text-white sm:rounded-lg">
        {/* <button onClick={onClose} className="absolute top-5 right-4">
        <X className="size-4" />
      </button> */}
        <button onClick={() => disconnect()} className="absolute top-5 right-4">
          <LogOut className="size-4" />
        </button>
        <div className="flex items-center gap-3">
          <img
            src={selectedToken.image}
            alt={`${selectedToken.symbol} icon`}
            className="size-12 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-bold">
              {selectedToken.name} ({selectedToken.symbol})
            </h3>

            <p className="text-sm opacity-80">
              {selectedToken.price !== null
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: selectedToken.price >= 1 ? 2 : 6,
                  }).format(selectedToken.price)
                : 'N/A'}
              {selectedToken.change['24h'] !== null && (
                <span
                  className={`ml-1 text-sm font-semibold ${
                    selectedToken.change['24h'] >= 0
                      ? 'text-emerald-300'
                      : 'text-rose-300'
                  }`}
                >
                  {selectedToken.change['24h'] >= 0 ? '+' : ''}
                  {selectedToken.change['24h'].toFixed(2)}% (24h)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-4 text-xs opacity-75">
          {selectedToken.marketCap !== null && (
            <p>
              Market cap:{' '}
              {new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 2,
              }).format(selectedToken.marketCap)}
            </p>
          )}
          {selectedToken.volume24h !== null && (
            <p>
              24h volume:{' '}
              {new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 2,
              }).format(selectedToken.volume24h)}
            </p>
          )}
        </div>
        <Chart
          data={[
            { time: '2018-12-22', value: 32.51 },
            { time: '2018-12-23', value: 31.11 },
            { time: '2018-12-24', value: 27.02 },
            { time: '2018-12-25', value: 27.32 },
            { time: '2018-12-26', value: 25.17 },
            { time: '2018-12-27', value: 28.89 },
            { time: '2018-12-28', value: 25.46 },
            { time: '2018-12-29', value: 23.92 },
            { time: '2018-12-30', value: 22.68 },
            { time: '2018-12-31', value: 22.67 },
          ]}
        />
        <Swap selectedToken={selectedToken} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
