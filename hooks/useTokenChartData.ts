import { useState, useEffect } from 'react'

interface ChartData {
  time: string | number
  value: number
}

export type Timeframe = '1H' | '24H' | '7D' | '30D'

interface UseTokenChartDataResult {
  data: ChartData[]
  isLoading: boolean
  error: string | null
}

const TIMEFRAME_CONFIG = {
  '1H': { endpoint: 'minute', limit: 60 },
  '24H': { endpoint: 'hour', limit: 24 },
  '7D': { endpoint: 'hour', limit: 168 },
  '30D': { endpoint: 'day', limit: 30 },
}

export function useTokenChartData(
  tokenAddress: string,
  network: string = 'base',
  timeframe: Timeframe = '24H',
): UseTokenChartDataResult {
  const [data, setData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!tokenAddress) return

      setIsLoading(true)
      setError(null)

      try {
        // 1. Get the top pool for the token
        const poolsResponse = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/${network}/tokens/${tokenAddress}/pools`,
        )

        if (!poolsResponse.ok) {
          throw new Error('Failed to fetch pools')
        }

        const poolsData = await poolsResponse.json()
        const topPool = poolsData.data?.[0]

        if (!topPool) {
          throw new Error('No pool found for this token')
        }

        const poolAddress = topPool.attributes.address

        // 2. Get OHLCV data for the pool using selected timeframe
        const config = TIMEFRAME_CONFIG[timeframe]
        const ohlcvResponse = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${poolAddress}/ohlcv/${config.endpoint}?limit=${config.limit}`,
        )

        if (!ohlcvResponse.ok) {
          throw new Error('Failed to fetch OHLCV data')
        }

        const ohlcvData = await ohlcvResponse.json()
        const ohlcvList = ohlcvData.data?.attributes?.ohlcv_list

        if (!ohlcvList || !Array.isArray(ohlcvList)) {
          throw new Error('Invalid OHLCV data format')
        }

        // Transform data for the chart
        // GeckoTerminal returns [timestamp, open, high, low, close, volume]
        // We'll use 'close' price for the line chart
        const useTimestamp = config.endpoint !== 'day' // Use timestamp for hour/minute, date for day

        const rawData = ohlcvList.map((item: number[]) => {
          const timestamp = item[0]
          return {
            time: useTimestamp
              ? timestamp // Unix timestamp for hour/minute data
              : new Date(timestamp * 1000).toISOString().split('T')[0], // Date string for day data
            value: item[4], // Close price
          }
        })

        // Remove duplicates by keeping the last occurrence of each time
        // and ensure ascending order
        const uniqueDataMap = new Map<string | number, number>()
        rawData.forEach((item) => {
          uniqueDataMap.set(item.time, item.value)
        })

        const formattedData = Array.from(uniqueDataMap.entries())
          .map(([time, value]) => ({ time, value }))
          .sort((a, b) => {
            if (typeof a.time === 'number' && typeof b.time === 'number') {
              return a.time - b.time
            }
            return String(a.time).localeCompare(String(b.time))
          })

        setData(formattedData)
      } catch (err) {
        console.error('Error fetching chart data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [tokenAddress, network, timeframe])

  return { data, isLoading, error }
}
