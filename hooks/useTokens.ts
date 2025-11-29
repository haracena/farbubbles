import { useQuery } from '@tanstack/react-query'
import { GeckoApiResponse } from '@/interfaces/GeckoTerminal'
import { geckoResponseToTokens } from '@/utils/tokenAdapter'

interface UseTokensParams {
  page?: number
  sort?: string
}

export function useTokens(params: UseTokensParams = {}) {
  const { page = 1, sort = '-24h_trend_score' } = params

  return useQuery({
    queryKey: ['tokens', { page, sort }],
    queryFn: async () => {
      console.log('useTokens: Starting fetch...')
      const searchParams = new URLSearchParams({
        page: page.toString(),
        sort,
      })

      const response = await fetch(`/api/tokens/prices?${searchParams}`)

      if (!response.ok) {
        console.error('useTokens: Fetch failed', response.status)
        throw new Error('Failed to fetch tokens')
      }

      const result = (await response.json()) as GeckoApiResponse
      console.log('useTokens: Got API response')

      // Convert GeckoTerminal format to Token format using adapter
      const tokens = geckoResponseToTokens(result)
      console.log('useTokens: Converted to tokens:', tokens.length)

      // Filter by chain (Base = 8453)
      const filtered = tokens.filter((token) => token.chain === 8453)
      console.log('useTokens: Filtered tokens:', filtered.length)

      return filtered
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 10000 * 60, // Refetch every 10 minute
  })
}
