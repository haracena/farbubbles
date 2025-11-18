import { NextRequest, NextResponse } from 'next/server'
import { getNotificationToken } from '@/lib/redis'

const MINIAPP_ID = 'basebubbles'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')

    if (!fid) {
      return NextResponse.json({ message: 'Missing fid' }, { status: 400 })
    }

    const userFid = parseInt(fid, 10)

    if (isNaN(userFid)) {
      return NextResponse.json({ message: 'Invalid fid' }, { status: 400 })
    }

    // Verificar si existe un token de notificaciones en Upstash Redis
    // Solo devolvemos un boolean por seguridad, sin exponer el token
    const tokenData = await getNotificationToken(MINIAPP_ID, userFid)

    return NextResponse.json({
      enabled: tokenData !== null,
    })
  } catch (error) {
    console.error('Error in /api/notifications/status:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    )
  }
}
