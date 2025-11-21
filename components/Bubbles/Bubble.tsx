'use client'

import { forwardRef, useRef } from 'react'

export interface BubbleProps {
  id: string
  size: number
  x: number
  y: number
  symbol: string
  change24h: number | null
  iconUrl: string
  onBubbleClick?: (id: string) => void
}

const Bubble = forwardRef<HTMLDivElement, BubbleProps>(
  ({ id, size, x, y, symbol, change24h, iconUrl, onBubbleClick }, ref) => {
    const pointerDownTime = useRef<number | null>(null)

    const handlePointerDown = () => {
      pointerDownTime.current = Date.now()
    }

    const handlePointerUp = () => {
      if (pointerDownTime.current) {
        const duration = Date.now() - pointerDownTime.current
        if (duration < 200 && onBubbleClick) {
          onBubbleClick(id)
        }
        pointerDownTime.current = null
      }
    }

    const changeValue = change24h ?? 0
    const isPositive = changeValue >= 0
    const baseColor = isPositive ? '#16a34a' : '#dc2626'
    const glowColor = isPositive ? '#34d399' : '#fb7185'
    const formattedChange =
      change24h !== null
        ? `${isPositive ? '+' : ''}${changeValue.toFixed(2)}%`
        : 'N/A'

    // Dynamic font sizing based on bubble size
    const symbolFontSize = Math.max(10, Math.min(20, size * 0.25)) // 25% of bubble size
    const percentageFontSize = symbolFontSize * 0.7 // 70% of symbol size

    return (
      <div
        ref={ref}
        className="absolute cursor-pointer transition-transform duration-300 ease-out"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          transform: `translate3d(${x}px, ${y}px, 0) scale(1)` as const,
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <div
          className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full transition-transform duration-300 ease-out"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${glowColor}75, ${baseColor}55)`,
            border: `2px solid ${glowColor}30`,
            //   boxShadow: `
            //   inset 0 0 20px ${glowColor}25,
            //   0 0 25px ${baseColor}30
            // `,
          }}
        >
          <div className="pointer-events-none flex flex-col items-center justify-center gap-1 px-2 text-center leading-tight text-white select-none">
            <img
              src={iconUrl}
              alt={`${symbol} icon`}
              className="pointer-events-none absolute top-1/2 left-1/2 size-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover opacity-40"
            />
            <span
              className="pointer-events-none relative font-bold text-white select-none"
              style={{ fontSize: `${symbolFontSize}px` }}
            >
              {symbol}
            </span>
            <span
              className="pointer-events-none relative font-semibold text-white select-none"
              style={{ fontSize: `${percentageFontSize}px` }}
            >
              {formattedChange}
            </span>
          </div>
        </div>
      </div>
    )
  },
)

Bubble.displayName = 'Bubble'

export default Bubble
