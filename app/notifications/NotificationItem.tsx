export default function NotificationItem() {
  //bg-gradient-to-r from-blue-950/35 to-neutral-950/45
  return (
    <div className="flex items-center gap-4 border-b border-neutral-800 bg-neutral-950/45 p-4">
      <img src="icon.webp" alt="" className="size-12 rounded-xl object-cover" />
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium text-neutral-100">Base Bubbles</h2>
        <p className="text-sm text-neutral-400">
          Welcome to the Base Bubbles! 🫧
        </p>
      </div>
    </div>
  )
}
