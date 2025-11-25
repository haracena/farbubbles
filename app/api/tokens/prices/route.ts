import { NextResponse } from 'next/server'
const API_URL = process.env.API_URL

export async function GET(request: Request) {
  const searchParams = request.nextUrl.searchParams
  const limit = searchParams.get('limit') || '50'
  const minPrice = searchParams.get('minPrice') || '0'
  const hasChange = searchParams.get('hasChange') || 'true'
  const response = await fetch(
    `${API_URL}/api/v1/tokens?limit=${limit}&minPrice=${minPrice}&hasChange=${hasChange}`,
  )
  const data = await response.json()
  return NextResponse.json(data)
}
