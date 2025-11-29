import {
  GeckoPool,
  GeckoToken,
  GeckoApiResponse,
} from '@/interfaces/GeckoTerminal'
import { Token } from '@/interfaces/Token'

/**
 * Safely parse a string to number, returning null if invalid
 */
function parseNumber(value: string | null | undefined): number | null {
  if (!value) return null
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

/**
 * Extract chain ID from GeckoTerminal pool ID
 * Since we're querying the Base network endpoint directly, all pools are on Base
 */
function extractChainId(_poolId: string): number {
  // GeckoTerminal pool IDs can be numeric or prefixed
  // Since we're querying /base/pools, all results are on Base chain
  return 8453 // Base
}

/**
 * Find a token in the included array by its ID
 */
function findIncludedToken(
  tokenId: string,
  included?: GeckoToken[],
): GeckoToken | undefined {
  return included?.find((token) => token.id === tokenId)
}

/**
 * Convert GeckoTerminal pool to simplified Token interface
 */
export function geckoPoolToToken(
  pool: GeckoPool,
  included?: GeckoToken[],
): Token {
  const { attributes } = pool

  // Find base token in included data using base_token_id
  const baseTokenId = attributes.base_token_id
  const baseToken = findIncludedToken(baseTokenId, included)

  // Extract base token address from relationships.tokens
  // Use the base token's address attribute from included data if available
  const tokenAddress = baseToken?.attributes?.address || attributes.address

  // Extract token symbol and name from pool name or base token
  // Pool name format: "SYMBOL / QUOTE" e.g., "REPPO / VIRTUAL"
  const [tokenSymbol] = attributes.name.split(' / ').map((s) => s.trim())

  // Get market cap from token_value_data using base_token_id
  const tokenValueData = attributes.token_value_data[baseTokenId]

  // Parse price percent changes (remove % sign and convert to number)
  const parsePercentChange = (value: string): number | null => {
    if (!value) return null
    const cleaned = value.replace('%', '').replace('+', '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
  }

  const token: Token = {
    id: pool.id,
    address: tokenAddress,
    chain: extractChainId(pool.id),
    name: baseToken?.attributes.name || tokenSymbol,
    symbol: baseToken?.attributes.symbol || tokenSymbol,
    price: parseNumber(attributes.price_in_usd),
    marketCap: tokenValueData?.market_cap_in_usd || null,
    volume24h: parseNumber(attributes.from_volume_in_usd),
    liquidity: parseNumber(attributes.reserve_in_usd),
    holders: null, // Not provided by GeckoTerminal
    change: {
      '1h': parsePercentChange(attributes.price_percent_changes.last_1h),
      '6h': parsePercentChange(attributes.price_percent_changes.last_6h),
      '24h': parsePercentChange(attributes.price_percent_changes.last_24h),
      '7d': null, // Not provided in this endpoint
    },
    image: baseToken?.attributes.image_url || '',
    deployedAt: attributes.pool_created_at,
  }

  return token
}

/**
 * Convert GeckoTerminal API response to Token array
 */
export function geckoResponseToTokens(response: GeckoApiResponse): Token[] {
  console.log('Converting GeckoTerminal response:', {
    poolsCount: response.data?.length,
    includedCount: response.included?.length,
  })

  try {
    const tokens = response.data
      .map((pool) => {
        try {
          return geckoPoolToToken(pool, response.included)
        } catch (error) {
          console.error('Error converting pool:', pool.id, error)
          return null
        }
      })
      .filter((token): token is Token => token !== null)

    console.log('Converted tokens:', {
      count: tokens.length,
      firstToken: tokens[0]
        ? {
            symbol: tokens[0].symbol,
            price: tokens[0].price,
            chain: tokens[0].chain,
          }
        : null,
    })

    return tokens
  } catch (error) {
    console.error('Error in geckoResponseToTokens:', error)
    return []
  }
}

/**
 * Extract base token data from a pool
 */
export function extractBaseToken(
  pool: GeckoPool,
  included?: GeckoToken[],
): GeckoToken | null {
  return (
    findIncludedToken(pool.relationships.base_token.data.id, included) || null
  )
}

/**
 * Calculate price change percentage between two values
 */
export function calculatePriceChange(
  currentPrice: number,
  previousPrice: number,
): number {
  if (previousPrice === 0) return 0
  return ((currentPrice - previousPrice) / previousPrice) * 100
}
