import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const swapFeeRecipient = '0x467051A5c4BD354fC0ca9fC1ed11Bf7F8F035730'
  const swapFeeBps = 15

  const chainId = searchParams.get('chainId')
  const buyToken = searchParams.get('buyToken')
  const sellToken = searchParams.get('sellToken')
  const sellAmount = searchParams.get('sellAmount')
  const taker = searchParams.get('taker')

  const API_KEY = process.env.ZEROX_API_KEY
  const BASE_ID = chainId ? parseInt(chainId) : 8453

  const headers = {
    '0x-api-key': API_KEY || '',
    '0x-version': 'v2',
  }

  const params = new URLSearchParams({
    chainId: BASE_ID.toString(),
    buyToken: buyToken || '',
    sellToken: sellToken || '',
    sellAmount: sellAmount || '',
    swapFeeRecipient,
    swapFeeBps: swapFeeBps.toString(),
  })

  if (taker) {
    params.append('taker', taker)
  }

  try {
    const quoteResponse = await fetch(
      `https://api.0x.org/swap/allowance-holder/quote?${params.toString()}`,
      {
        headers,
      },
    )

    if (!quoteResponse.ok) {
      const errorData = await quoteResponse.json().catch(() => ({}))
      console.error('0x API error:', {
        status: quoteResponse.status,
        statusText: quoteResponse.statusText,
        error: errorData,
      })
      return NextResponse.json(
        { error: 'Failed to fetch quote', details: errorData },
        { status: quoteResponse.status },
      )
    }

    const quoteData = await quoteResponse.json()
    return NextResponse.json(quoteData)
  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
