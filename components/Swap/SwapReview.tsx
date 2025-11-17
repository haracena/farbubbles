'use client'

import { formatUnits } from 'viem'
import { Loader, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SwapReviewProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  quote: Record<string, unknown> | null
  sellToken: { symbol: string; address?: string }
  buyToken: { symbol: string; address?: string }
  sellAmount: string
  buyAmount: string
  isLoading: boolean
}

export default function SwapReview({
  isOpen,
  onClose,
  onConfirm,
  quote,
  sellToken,
  buyToken,
  sellAmount,
  buyAmount,
  isLoading,
}: SwapReviewProps) {
  // Calcular fees con type assertions seguras
  const fees = quote?.fees as
    | {
        integratorFee?: { amount: string }
        zeroExFee?: { amount: string }
      }
    | undefined

  const integratorFee = fees?.integratorFee?.amount
    ? formatUnits(BigInt(fees.integratorFee.amount), 18) // Asumiendo 18 decimales
    : '0'

  const zeroExFee = fees?.zeroExFee?.amount
    ? formatUnits(BigInt(fees.zeroExFee.amount), 18)
    : '0'

  const estimatedGas = quote?.estimatedGas
    ? (parseInt(String(quote.estimatedGas)) / 1e9).toFixed(6)
    : '0'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-white/20 bg-neutral-800 p-0 text-white sm:rounded-2xl">
        <div className="p-6">
          <DialogHeader>
            <div className="mb-4 flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-white">
                Review Swap
              </DialogTitle>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Swap Summary */}
            <div className="rounded-lg border border-white/20 bg-white/5 p-4">
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-sm text-neutral-400">You pay</p>
                  <p className="text-xl font-semibold text-white">
                    {sellAmount} {sellToken.symbol}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-400">You receive</p>
                  <p className="text-xl font-semibold text-white">
                    {buyAmount} {buyToken.symbol}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/5 p-4">
              <div className="flex flex-col gap-2">
                <p className="flex items-center gap-1 text-xs text-neutral-400">
                  <span className="text-neutral-100">0.15%</span>{' '}
                  {/* <img
                  src="assets/images/logos/0x-logo.webp"
                  alt="0x"
                  className="size-3 rounded-full"
                />{' '} */}
                  0x Protocol fee
                </p>
                <p className="text-xs text-neutral-400">
                  <span className="text-neutral-100">0%</span> Platform fee
                  (November)
                </p>
              </div>
            </div>

            {/* Fees Breakdown */}
            {/* <div className="rounded-lg border border-white/20 bg-white/5 p-4">
            <h3 className="mb-2 text-sm font-semibold text-neutral-300">
              Fees
            </h3>
            <div className="space-y-1 text-sm">
              {parseFloat(integratorFee) > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Platform fee</span>
                  <span className="text-white">{integratorFee}</span>
                </div>
              )}
              {parseFloat(zeroExFee) > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">0x fee</span>
                  <span className="text-white">{zeroExFee}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-400">Estimated gas</span>
                <span className="text-white">{estimatedGas} ETH</span>
              </div>
            </div>
          </div> */}

            {/* Warning */}
            {/* <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
            <p className="text-xs text-yellow-200">
              Please review the details above. The transaction will be executed
              on-chain and cannot be reversed.
            </p>
          </div> */}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-white/20 bg-white/10 p-3 text-white transition-colors hover:bg-white/20 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Confirm button clicked, quote:', quote)
                  if (!quote) {
                    console.error('No quote available when confirming')
                    return
                  }
                  onConfirm()
                }}
                disabled={isLoading || !quote}
                className="flex-1 rounded-lg bg-blue-500 p-3 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="size-4 animate-spin" />
                    Executing...
                  </span>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 opacity-75">
              <p className="text-xs text-neutral-400">Powered by</p>
              <img
                src="assets/images/logos/0x-logo.webp"
                alt="0x"
                className="size-4 rounded-xs"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
