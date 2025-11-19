import { useState, useEffect } from 'react'

interface ChartData {
  time: string
  value: number
}

interface UseTokenChartDataResult {
  data: ChartData[]
  isLoading: boolean
  error: string | null
}

export function useTokenChartData(
  tokenAddress: string,
  network: string = 'base',
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

        // 2. Get OHLCV data for the pool
        // Using 'day' timeframe for now, can be made dynamic
        const ohlcvResponse = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${poolAddress}/ohlcv/day?limit=60`,
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
        const rawData = ohlcvList.map((item: number[]) => ({
          time: new Date(item[0] * 1000).toISOString().split('T')[0],
          value: item[4], // Close price
        }))

        // Remove duplicates by keeping the last occurrence of each date
        // and ensure ascending order
        const uniqueDataMap = new Map<string, number>()
        rawData.forEach((item) => {
          uniqueDataMap.set(item.time, item.value)
        })

        const formattedData = Array.from(uniqueDataMap.entries())
          .map(([time, value]) => ({ time, value }))
          .sort((a, b) => a.time.localeCompare(b.time)) // Ensure ascending order

        setData(formattedData)
      } catch (err) {
        console.error('Error fetching chart data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [tokenAddress, network])

  return { data, isLoading, error }
}
