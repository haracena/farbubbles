import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '1'
  const sort = searchParams.get('sort') || '-24h_trend_score'

  try {
    // GeckoTerminal API endpoint for Base network pools
    const geckoUrl = new URL('https://app.geckoterminal.com/api/p1/base/pools')

    // Add query parameters
    geckoUrl.searchParams.set(
      'include',
      'dex,dex.network,dex.network.network_metric,tokens',
    )
    geckoUrl.searchParams.set('page', page)
    geckoUrl.searchParams.set('include_network_metrics', 'true')
    geckoUrl.searchParams.set('include_meta', '1')
    geckoUrl.searchParams.set('sort', sort)
    geckoUrl.searchParams.set('networks', 'base')

    console.log('Fetching from GeckoTerminal:', geckoUrl.toString())

    const response = await fetch(geckoUrl.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; FarBubbles/1.0)',
      },
      next: {
        revalidate: 60, // Cache for 60 seconds
      },
    })

    if (!response.ok) {
      console.error(
        'GeckoTerminal API error:',
        response.status,
        response.statusText,
      )
      throw new Error(`GeckoTerminal API returned ${response.status}`)
    }

    const data = await response.json()

    // Log the structure for verification
    console.log('GeckoTerminal response structure:', {
      hasData: !!data.data,
      dataLength: data.data?.length,
      hasIncluded: !!data.included,
      includedLength: data.included?.length,
      firstPool: data.data?.[0]
        ? {
            id: data.data[0].id,
            type: data.data[0].type,
            hasAttributes: !!data.data[0].attributes,
            hasRelationships: !!data.data[0].relationships,
          }
        : null,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching from GeckoTerminal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token data' },
      { status: 500 },
    )
  }
}
