'use client'

import { Bubbles, User, List, Bell } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useCallback, memo } from 'react'

const TabBar = memo(function TabBar() {
  const pathname = usePathname()
  const router = useRouter()

  const activeTab = useMemo(() => pathname.split('/')[1] || '', [pathname])

  const handleTabClick = useCallback(
    (tab: string) => {
      router.push(tab)
    },
    [router],
  )

  const tabs = useMemo(
    () => [
      { id: '', path: '/', icon: Bubbles },
      { id: 'tokens', path: '/tokens', icon: List },
      { id: 'notifications', path: '/notifications', icon: Bell },
      { id: 'profile', path: '/profile', icon: User },
    ],
    [],
  )

  return (
    <div className="fixed right-2 bottom-2 left-2 grid grid-cols-4 justify-items-center gap-2 rounded-2xl border border-neutral-200/10 bg-neutral-800/90 p-1 ring-4 ring-white/5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon

        return (
          <div
            key={tab.id}
            className={`group relative flex cursor-pointer items-center justify-center rounded-xl p-4 transition-all duration-300 hover:bg-neutral-900/45 ${
              isActive ? 'bg-neutral-900/50' : ''
            }`}
            onClick={() => handleTabClick(tab.path)}
          >
            <Icon className="size-4 text-neutral-400 transition-all duration-300 group-active:scale-90" />
            <div
              className={`absolute bottom-0 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-t-xl ${
                isActive ? 'bg-lime-500/80' : 'bg-transparent'
              }`}
            ></div>
          </div>
        )
      })}
    </div>
  )
})

export default TabBar
