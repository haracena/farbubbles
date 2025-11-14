export interface Token {
  id: number
  symbol: string
  name: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  iconUrl: string
  address?: `0x${string}` // Contract address for ERC20 tokens
}
