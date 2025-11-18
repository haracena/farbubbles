'use client'
import NotificationItem from './NotificationItem'
import NotificationToggle from '@/components/Notifications/NotificationToggle'

export default function Notifications() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <NotificationToggle />
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-white">
          Recent Notifications
        </h2>
        <div className="flex flex-col overflow-hidden rounded-lg">
          <NotificationItem />
        </div>
      </div>
    </div>
  )
}
