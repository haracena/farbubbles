'use client'

import { Bubbles, User, Settings, Wallet, Bell } from 'lucide-react'
import ShareAppButton from '../ShareAppButton'
import { usePathname, useRouter } from 'next/navigation'
export default function TabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const activeTab = pathname.split('/')[1]
  console.log(activeTab)
  const isActive = (tab: string) => `${activeTab}` === tab

  const handleTabClick = (tab: string) => {
    router.push(`${tab}`)
  }
  return (
    <div className="fixed right-2 bottom-2 left-2 grid grid-cols-4 justify-items-center gap-2 rounded-3xl border border-neutral-200/10 bg-neutral-800/85 px-2 py-2 ring-4 ring-white/5">
      <div
        className={`group relative flex cursor-pointer items-center justify-center rounded-xl p-4 transition-all duration-300 hover:bg-neutral-900/45 ${isActive('') ? 'bg-neutral-900/50' : ''}`}
        onClick={() => handleTabClick('/')}
      >
        <Bubbles className="size-5 text-neutral-400 transition-all duration-300 group-active:scale-90" />
        <div
          className={`absolute bottom-0 left-1/2 h-1 w-6 -translate-x-1/2 rounded-t-xl ${isActive('') ? 'bg-lime-500/80' : 'bg-transparent'}`}
        ></div>
      </div>
      <div
        className={`group relative flex cursor-pointer items-center justify-center rounded-xl p-4 transition-all duration-300 hover:bg-neutral-900/45 ${isActive('wallet') ? 'bg-neutral-900/50' : ''}`}
        onClick={() => handleTabClick('/wallet')}
      >
        <Wallet className="size-5 text-neutral-400 transition-all duration-300 group-active:scale-90" />
        <div
          className={`absolute bottom-0 left-1/2 h-1 w-6 -translate-x-1/2 rounded-t-xl ${isActive('wallet') ? 'bg-lime-500/80' : 'bg-transparent'}`}
        ></div>
      </div>
      <div
        className={`group relative flex cursor-pointer items-center justify-center rounded-xl p-4 transition-all duration-300 hover:bg-neutral-900/45 ${isActive('notifications') ? 'bg-neutral-900/50' : ''}`}
        onClick={() => handleTabClick('/notifications')}
      >
        <Bell className="size-5 text-neutral-400 transition-all duration-300 group-active:scale-90" />
        <div
          className={`absolute bottom-0 left-1/2 h-1 w-6 -translate-x-1/2 rounded-t-xl ${isActive('notifications') ? 'bg-lime-500/80' : 'bg-transparent'}`}
        ></div>
      </div>
      <div
        className={`group relative flex cursor-pointer items-center justify-center rounded-xl p-4 transition-all duration-300 hover:bg-neutral-900/45 ${isActive('profile') ? 'bg-neutral-900/50' : ''}`}
        onClick={() => handleTabClick('/profile')}
      >
        <User className="size-5 text-neutral-400 transition-all duration-300 group-active:scale-90" />
        <div
          className={`absolute bottom-0 left-1/2 h-1 w-6 -translate-x-1/2 rounded-t-xl ${isActive('profile') ? 'bg-lime-500/80' : 'bg-transparent'}`}
        ></div>
      </div>
    </div>
  )
}
