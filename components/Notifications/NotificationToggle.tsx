'use client'

import { useEffect, useState } from 'react'
import { useMiniKit } from '@coinbase/onchainkit/minikit'
import { sdk } from '@farcaster/miniapp-sdk'
import { Bell, BellOff, Loader } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '../ui/switch'

interface NotificationStatus {
  enabled: boolean
}

export default function NotificationToggle() {
  const { context } = useMiniKit()
  const [status, setStatus] = useState<NotificationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnabling, setIsEnabling] = useState(false)

  // Verificar estado de notificaciones
  useEffect(() => {
    const checkNotificationStatus = async () => {
      // Verificar si estamos en un miniapp (context existe)
      if (!context?.user?.fid) {
        setIsLoading(false)
        return
      }

      // Según la documentación: context.user.fid es string (Farcaster ID)
      const fid = context.user.fid

      try {
        setIsLoading(true)

        // Simplemente pasar el fid como query param
        const response = await fetch(`/api/notifications/status?fid=${fid}`)

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Unknown error' }))
          console.error('Notification status API error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            fid,
          })
          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`,
          )
        }

        const data: NotificationStatus = await response.json()
        console.log(data)
        setStatus(data)
      } catch (error) {
        console.error('Error checking notification status:', error)
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to check notification status'
        toast.error('Error', {
          description: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkNotificationStatus()
  }, [context?.user?.fid])

  // Activar notificaciones
  const enableNotifications = async () => {
    // Verificar si estamos en un miniapp
    if (!context) {
      toast.error('Error', {
        description: 'Not authenticated',
      })
      return
    }

    try {
      setIsEnabling(true)

      // Llamar a addMiniApp para solicitar permisos de notificaciones
      const response = await sdk.actions.addMiniApp()

      if (response.notificationDetails) {
        // El usuario habilitó notificaciones
        toast.success('Success', {
          description: 'Notifications enabled!',
        })
        // Verificar el estado actualizado (el webhook debería haberlo guardado)
        // Esperar un poco para que el webhook procese
        setTimeout(async () => {
          if (!context?.user?.fid) return
          const response = await fetch(
            `/api/notifications/status?fid=${context.user.fid}`,
          )
          if (response.ok) {
            const data: NotificationStatus = await response.json()
            setStatus(data)
          }
        }, 1000)
      } else {
        // El usuario agregó la app pero no habilitó notificaciones
        toast.info('Info', {
          description: 'Mini app added. Enable notifications in settings.',
        })
        if (!context?.user?.fid) return
        const response = await fetch(
          `/api/notifications/status?fid=${context.user.fid}`,
        )
        if (response.ok) {
          const data: NotificationStatus = await response.json()
          setStatus(data)
        }
      }
    } catch (error: unknown) {
      console.error('Error enabling notifications:', error)

      // Manejar diferentes tipos de errores del SDK
      if (error && typeof error === 'object' && 'name' in error) {
        if (error.name === 'RejectedByUser') {
          toast.error('Cancelled', {
            description: 'Notification request was cancelled',
          })
        } else if (error.name === 'InvalidDomainManifestJson') {
          toast.error('Error', {
            description: 'Invalid domain configuration',
          })
        } else {
          toast.error('Error', {
            description: 'Failed to enable notifications',
          })
        }
      } else {
        toast.error('Error', {
          description: 'Failed to enable notifications',
        })
      }
    } finally {
      setIsEnabling(false)
    }
  }

  // Manejar el toggle del Switch
  const handleToggle = async (checked: boolean) => {
    if (checked) {
      // Intentar habilitar notificaciones
      await enableNotifications()
    } else {
      // Las notificaciones se deshabilitan desde la configuración de la app
      // No hay método del SDK para deshabilitarlas directamente
      toast.info('Info', {
        description: 'Disable notifications from app settings',
      })
      // Actualizar estado local inmediatamente para mejor UX
      setStatus({ enabled: false })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 p-4">
        <Loader className="size-5 animate-spin text-neutral-400" />
        <span className="text-sm text-neutral-400">
          Checking notification status...
        </span>
      </div>
    )
  }

  if (!context) {
    return (
      <div className="rounded-lg border border-white/20 bg-white/5 p-4">
        <p className="text-sm text-neutral-400">
          Please connect to check notification status
        </p>
      </div>
    )
  }

  if (status === null) {
    return null
  }

  return (
    <div className="rounded-lg border border-white/20 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status.enabled ? (
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <Bell className="size-5 text-emerald-400" />
            </div>
          ) : (
            <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-500/20">
              <BellOff className="size-5 text-neutral-400" />
            </div>
          )}
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-white">
              {status.enabled
                ? 'Notifications Enabled'
                : 'Notifications Disabled'}
            </h3>
            <p className="text-xs text-neutral-400">
              {status.enabled
                ? 'You will receive updates about your swaps'
                : 'Enable notifications to stay updated'}
            </p>
          </div>
        </div>

        <Switch
          checked={status.enabled}
          onCheckedChange={handleToggle}
          disabled={isEnabling || isLoading}
        />
      </div>
    </div>
  )
}
