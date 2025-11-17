export interface Token {
  id: string
  address: string
  chain: number
  name: string
  symbol: string
  price: number | null
  marketCap: number | null
  volume24h: number | null
  liquidity: number | null
  holders: number | null
  change: {
    '1h': number | null
    '24h': number | null
    '7d': number | null
  }
  image: string
  deployedAt: string
}
