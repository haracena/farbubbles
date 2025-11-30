import { Token } from '@/interfaces/Token'

// Base tokens for trading only (USDC, ETH)
// These will NOT appear in bubbles, only in swap selector
export const baseTokens: Token[] = [
  {
    id: 'usdc-base',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    chain: 8453,
    name: 'USD Coin',
    symbol: 'USDC',
    price: 1.0,
    marketCap: 28000000000000,
    volume24h: 8000000000,
    liquidity: 28000000000000,
    holders: null,
    change: {
      '1h': null,
      '24h': 0.0,
      '7d': null,
    },
    image:
      'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1696501939',
    deployedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: 'eth-base',
    chain: 8453,
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3500.0,
    marketCap: 50000000000,
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    volume24h: 2000000000,
    liquidity: 50000000000,
    holders: null,
    change: {
      '1h': null,
      '24h': 2.5,
      '7d': null,
    },
    image:
      'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628',
    deployedAt: '2023-01-01T00:00:00.000Z',
  },
]
