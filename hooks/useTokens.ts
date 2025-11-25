import { useQuery } from '@tanstack/react-query'
import { Token } from '@/interfaces/Token'

interface UseTokensParams {
  limit?: number
  minPrice?: number
  hasChange?: boolean
}

interface ApiResponse {
  data: Token[]
}

export function useTokens(params: UseTokensParams = {}) {
  const { limit = 50, minPrice = 0, hasChange = true } = params

  return useQuery({
    queryKey: ['tokens', { limit, minPrice, hasChange }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        limit: limit.toString(),
        minPrice: minPrice.toString(),
        hasChange: hasChange.toString(),
      })

      const response = await fetch(`/api/tokens/prices?${searchParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch tokens')
      }

      const result = (await response.json()) as ApiResponse
      return result.data.filter((token) => token.chain === 8453)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}
