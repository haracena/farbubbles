'use client'
import { Token } from '@/interfaces/Token'
import { useState } from 'react'
import BubbleModal from '../Bubbles/BubbleModal'

interface TokenSymbolModalProps {
  token: Token
}

export default function TokenSymbolModal({ token }: TokenSymbolModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <div className="flex items-center gap-3" onClick={() => setIsOpen(true)}>
        <div className="relative size-8 shrink-0 overflow-hidden rounded-full">
          <img
            src={token.image}
            alt={token.symbol}
            className="size-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-white">{token.symbol}</span>
          <span className="max-w-[100px] truncate text-xs text-neutral-400">
            {token.name}
          </span>
        </div>
      </div>
      {isOpen && (
        <BubbleModal selectedToken={token} onClose={() => setIsOpen(false)} />
      )}
    </>
  )
}
