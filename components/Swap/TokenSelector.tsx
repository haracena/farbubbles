'use client'
import { Token } from '@/interfaces/Token'
import { Dialog, DialogContent } from '../ui/dialog'
import { X, Search } from 'lucide-react'
import { useState } from 'react'

interface TokenSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectToken: (token: Token) => void
  currentToken: Token
  excludeToken?: Token
  availableTokens: Token[]
}

function TokenRow({
  token,
  isSelected,
  onSelect,
}: {
  token: Token
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      disabled={isSelected}
      className={`flex w-full items-center justify-between rounded-lg p-3 transition-colors ${
        isSelected
          ? 'cursor-not-allowed bg-neutral-700/50 opacity-50'
          : 'hover:bg-neutral-700/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={token.image}
          alt={token.symbol}
          className="size-8 rounded-full object-cover"
        />
        <div className="text-left">
          <p className="font-medium">{token.symbol}</p>
          <p className="text-xs text-neutral-400">{token.name}</p>
        </div>
      </div>
      {/* {token.price !== null && (
        <div className="text-right">
          <p className="text-sm text-neutral-400">
            $
            {token.price < 0.01
              ? token.price.toFixed(6)
              : token.price.toFixed(2)}
          </p>
        </div>
      )} */}
    </button>
  )
}

export default function TokenSelector({
  isOpen,
  onClose,
  onSelectToken,
  currentToken,
  excludeToken,
  availableTokens,
}: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTokens = availableTokens.filter((token) => {
    const matchesSearch =
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    const isNotExcluded =
      !excludeToken || token.address !== excludeToken.address
    return matchesSearch && isNotExcluded
  })

  const handleSelectToken = (token: Token) => {
    onSelectToken(token)
    onClose()
    setSearchQuery('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="mt-0 w-[95vw] max-w-md space-y-3 rounded-lg border border-white/20 bg-neutral-800/95 p-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Select a token</h3>
          <button onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name or symbol"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-neutral-700/50 py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Token list */}
        <div className="max-h-[400px] space-y-1 overflow-y-auto">
          {filteredTokens.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">
              No tokens found
            </p>
          ) : (
            filteredTokens.map((token) => (
              <TokenRow
                key={token.address}
                token={token}
                isSelected={token.address === currentToken.address}
                onSelect={() => handleSelectToken(token)}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
