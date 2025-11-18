'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()
  const [isEnabling, setIsEnabling] = useState(false)
  const [shouldPoll, setShouldPoll] = useState(false)

  const fid = context?.user?.fid

  // Query para verificar estado de notificaciones con polling condicional
  const {
    data: status,
    isLoading,
    error,
  } = useQuery<NotificationStatus>({
    queryKey: ['notification-status', fid],
    queryFn: async () => {
      if (!fid) throw new Error('No FID available')

      const response = await fetch(`/api/notifications/status?fid=${fid}`)

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Unknown error' }))
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        )
      }

      return response.json()
    },
    enabled: !!fid,
    retry: shouldPoll ? 5 : 2, // Más reintentos cuando estamos esperando el webhook
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Backoff exponencial: 1s, 2s, 4s, 8s, 10s max
    refetchInterval: shouldPoll ? 2000 : false, // Poll cada 2 segundos cuando esperamos el webhook
    refetchIntervalInBackground: false,
  })

  console.log(status)

  // Detectar cuando las notificaciones se habilitan y dejar de hacer polling
  useEffect(() => {
    if (status?.enabled && shouldPoll) {
      setShouldPoll(false)
    }
  }, [status?.enabled, shouldPoll])

  // Mostrar error si hay (solo una vez cuando no estamos haciendo polling)
  useEffect(() => {
    if (error && !shouldPoll && !isLoading) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to check notification status'
      toast.error('Error', {
        description: errorMessage,
      })
    }
  }, [error, shouldPoll, isLoading])

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
        // Activar polling para verificar cuando el webhook guarde el token
        setShouldPoll(true)
        // Invalidar query para forzar refetch inmediato
        queryClient.invalidateQueries({
          queryKey: ['notification-status', fid],
        })
        // Dejar de hacer polling después de 30 segundos máximo
        setTimeout(() => {
          setShouldPoll(false)
        }, 30000)
      } else {
        // El usuario agregó la app pero no habilitó notificaciones
        toast.info('Info', {
          description: 'Mini app added. Enable notifications in settings.',
        })
        // Invalidar para actualizar estado
        queryClient.invalidateQueries({
          queryKey: ['notification-status', fid],
        })
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
      // Actualizar estado optimísticamente
      queryClient.setQueryData<NotificationStatus>(
        ['notification-status', fid],
        { enabled: false },
      )
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

  if (!status) {
    return null
  }

  return (
    <div className="rounded-lg border border-white/20 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status.enabled ? (
            <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/20">
              <Bell className="size-5 text-green-400" />
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
                ? "You're all set! We'll keep you updated"
                : 'Enable notifications to stay updated'}
            </p>
          </div>
        </div>

        <Switch
          checked={status.enabled}
          onCheckedChange={handleToggle}
          disabled={isEnabling || isLoading || status?.enabled}
        />
      </div>
    </div>
  )
}
