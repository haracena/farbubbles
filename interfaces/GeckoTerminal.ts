// GeckoTerminal API Response Types

export interface GeckoTransactionPeriod {
  buys: number
  sells: number
  buyers: number
  sellers: number
}

export interface GeckoTransactions {
  m5: GeckoTransactionPeriod
  m15: GeckoTransactionPeriod
  m30: GeckoTransactionPeriod
  h1: GeckoTransactionPeriod
  h6: GeckoTransactionPeriod
  h24: GeckoTransactionPeriod
}

export interface GeckoPriceChangePercentage {
  m5: string
  m15: string
  m30: string
  h1: string
  h6: string
  h24: string
}

export interface GeckoVolumeUsd {
  m5: string
  m15: string
  m30: string
  h1: string
  h6: string
  h24: string
}

export interface GeckoPricePercentChanges {
  last_5m: string
  last_15m: string
  last_30m: string
  last_1h: string
  last_6h: string
  last_24h: string
}

export interface GeckoTokenValueData {
  fdv_in_usd: number
  market_cap_in_usd: number
  market_cap_to_holders_ratio: number
}

export interface GeckoPoolAttributes {
  address: string
  name: string
  from_volume_in_usd: string
  to_volume_in_usd: string
  swap_count_24h: number
  price_percent_change: string
  price_percent_changes: GeckoPricePercentChanges
  base_token_id: string
  token_value_data: Record<string, GeckoTokenValueData>
  price_in_usd: string
  reserve_in_usd: string
  pool_created_at: string
}

export interface GeckoTokenReference {
  data: {
    id: string
    type: 'token'
  }
}

export interface GeckoDexReference {
  data: {
    id: string
    type: 'dex'
  }
}

export interface GeckoPoolRelationships {
  base_token: GeckoTokenReference
  quote_token: GeckoTokenReference
  dex: GeckoDexReference
  tokens: {
    data: Array<{
      id: string
      type: 'token'
    }>
  }
}

export interface GeckoPool {
  id: string
  type: 'pool'
  attributes: GeckoPoolAttributes
  relationships: GeckoPoolRelationships
}

export interface GeckoTokenAttributes {
  address: string
  name: string
  symbol: string
  image_url: string | null
  coingecko_coin_id: string | null
  decimals: number
  total_supply: string | null
  price_usd: string | null
  fdv_usd: string | null
  total_reserve_in_usd: string | null
  volume_usd: {
    h24: string
  }
  market_cap_usd: string | null
}

export interface GeckoToken {
  id: string
  type: 'token'
  attributes: GeckoTokenAttributes
}

export interface GeckoApiResponse {
  data: GeckoPool[]
  included?: GeckoToken[]
}
