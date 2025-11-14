import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const chainId = searchParams.get('chainId')
  const buyToken = searchParams.get('buyToken')
  const sellToken = searchParams.get('sellToken')
  const sellAmount = searchParams.get('sellAmount')

  const API_KEY = process.env.ZEROX_API_KEY
  const BASE_ID = chainId ? parseInt(chainId) : 8453

  const headers = {
    '0x-api-key': API_KEY || '',
    '0x-version': 'v2',
  }

  const priceResponse = await fetch(
    `https://api.0x.org/swap/allowance-holder/price?chainId=${BASE_ID}&buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${sellAmount}`,
    {
      headers,
    },
  )

  const priceData = await priceResponse.json()

  return NextResponse.json(priceData)
}
