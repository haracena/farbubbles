import { Bubbles, User, Settings, Wallet, Bell } from 'lucide-react'
export default function TabBar() {
  return (
    <div className="fixed right-2 bottom-2 left-2 grid grid-cols-4 justify-items-center gap-2 rounded-3xl border border-neutral-200/10 bg-neutral-700/50 px-2 py-4 ring-4 ring-neutral-50/10 backdrop-blur-sm">
      <Bubbles className="size-6 text-neutral-400" />
      <Wallet className="size-6 text-neutral-400" />
      <Bell className="size-6 text-neutral-400" />
      <User className="size-6 text-neutral-400" />
    </div>
  )
}
