import { Redis } from '@upstash/redis'
import { NotificationTokenData } from './types'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Generar key único por miniapp y usuario
function getNotificationKey(miniappId: string, fid: number): string {
  return `notification:${miniappId}:${fid}`
}

export async function saveNotificationToken(
  miniappId: string,
  fid: number,
  token: string,
  url: string,
): Promise<void> {
  const key = getNotificationKey(miniappId, fid)

  const data: NotificationTokenData = {
    token,
    url,
    miniapp_id: miniappId,
    fid,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  await redis.set(key, data)
}

export async function getNotificationToken(
  miniappId: string,
  fid: number,
): Promise<NotificationTokenData | null> {
  const key = getNotificationKey(miniappId, fid)
  return await redis.get<NotificationTokenData>(key)
}

export async function deleteNotificationToken(
  miniappId: string,
  fid: number,
): Promise<void> {
  const key = getNotificationKey(miniappId, fid)
  await redis.del(key)
}

// Para tu job: obtener todos los tokens de una miniapp
export async function getAllTokensForMiniapp(
  miniappId: string,
): Promise<NotificationTokenData[]> {
  const pattern = `notification:${miniappId}:*`
  const keys = await redis.keys(pattern)

  if (keys.length === 0) return []

  const tokens = await redis.mget<NotificationTokenData[]>(...keys)
  return tokens.filter((t): t is NotificationTokenData => t !== null)
}
