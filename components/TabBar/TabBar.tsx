import { Bubbles, User, Settings, Wallet, Bell } from 'lucide-react'
import ShareAppButton from '../ShareAppButton'
export default function TabBar() {
  return (
    <div className="fixed right-2 bottom-2 left-2 grid grid-cols-4 justify-items-center gap-2 rounded-3xl border border-neutral-200/10 bg-neutral-700/50 px-2 py-2 ring-4 ring-white/5 backdrop-blur-sm">
      <div className="group relative flex cursor-pointer items-center justify-center rounded-xl bg-neutral-900/50 p-4 transition-all duration-300 hover:bg-neutral-800/50">
        <Bubbles className="size-5 text-neutral-400 transition-all duration-300 group-active:scale-90" />
        <div className="absolute bottom-0 left-1/2 h-1 w-6 -translate-x-1/2 rounded-t-xl bg-lime-500/80"></div>
      </div>
      <div className="group relative flex cursor-pointer items-center justify-center rounded-xl p-4 transition-all duration-300 hover:bg-neutral-800/50">
        <Wallet className="size-5 text-neutral-400 transition-all duration-300 group-active:scale-90" />
      </div>
      <div className="group relative flex cursor-pointer items-center justify-center rounded-xl p-4 transition-all duration-300 hover:bg-neutral-800/50">
        <Bell className="size-5 text-neutral-400 transition-all duration-300 group-active:scale-90" />
      </div>
      <div className="group relative flex cursor-pointer items-center justify-center rounded-xl p-4 transition-all duration-300 hover:bg-neutral-800/50">
        <User className="size-5 text-neutral-400 transition-all duration-300 group-active:scale-90" />
      </div>
    </div>
  )
}
