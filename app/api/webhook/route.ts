import { NextRequest, NextResponse } from 'next/server'
import {
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
  ParseWebhookEvent,
} from '@farcaster/miniapp-node'
import {
  saveNotificationToken,
  deleteNotificationToken,
} from '../../../lib/redis'

const MINIAPP_ID = 'basebubbles'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 1. Leer el body del webhook
    const requestJson = await request.json()

    console.log('📥 Webhook recibido:', {
      timestamp: new Date().toISOString(),
      body: requestJson,
    })

    // 2. Verificar la firma con Neynar
    const data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar)

    console.log('✅ Firma verificada:', {
      event: data.event,
      fid: data.fid,
    })

    // 3. Procesar según el tipo de evento
    switch (data.event.event) {
      case 'miniapp_added':
        console.log(`👤 Usuario ${data.fid} agregó la miniapp`)

        // Puede incluir notificationDetails desde el inicio
        if (data.event.notificationDetails) {
          await saveNotificationToken(
            MINIAPP_ID,
            data.fid,
            data.event.notificationDetails.token,
            data.event.notificationDetails.url,
          )
          console.log(`💾 Token guardado para FID ${data.fid}`)
        }
        break

      case 'notifications_enabled':
        console.log(`🔔 Usuario ${data.fid} habilitó notificaciones`)

        await saveNotificationToken(
          MINIAPP_ID,
          data.fid,
          data.event.notificationDetails.token,
          data.event.notificationDetails.url,
        )
        console.log(`💾 Token guardado para FID ${data.fid}`)
        break

      case 'notifications_disabled':
        console.log(`🔕 Usuario ${data.fid} deshabilitó notificaciones`)

        await deleteNotificationToken(MINIAPP_ID, data.fid)
        console.log(`🗑️ Token eliminado para FID ${data.fid}`)
        break

      case 'miniapp_removed':
        console.log(`👋 Usuario ${data.fid} removió la miniapp`)

        await deleteNotificationToken(MINIAPP_ID, data.fid)
        console.log(`🗑️ Token eliminado para FID ${data.fid}`)
        break

      default:
        console.log('⚠️ Evento desconocido:', data.event)
    }

    const duration = Date.now() - startTime
    console.log(`⏱️ Webhook procesado en ${duration}ms`)

    // 4. SIEMPRE responder 200 OK
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('❌ Error procesando webhook:', error)

    // Manejar errores específicos de verificación
    if (error instanceof Error) {
      const err = error as ParseWebhookEvent.ErrorType

      switch (err.name) {
        case 'VerifyJsonFarcasterSignature.InvalidDataError':
        case 'VerifyJsonFarcasterSignature.InvalidEventDataError':
          console.error('🚫 Datos inválidos en el request')
          return NextResponse.json(
            { error: 'Invalid request data' },
            { status: 400 },
          )

        case 'VerifyJsonFarcasterSignature.InvalidAppKeyError':
          console.error('🔑 App key inválida')
          return NextResponse.json(
            { error: 'Invalid app key' },
            { status: 403 },
          )

        case 'VerifyJsonFarcasterSignature.VerifyAppKeyError':
          console.error('⚠️ Error verificando app key (Neynar)')
          // Farcaster reintentará
          return NextResponse.json(
            { error: 'Verification error, will retry' },
            { status: 500 },
          )
      }
    }

    // Error genérico - Farcaster reintentará
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
