'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useMiniKit } from '@coinbase/onchainkit/minikit'
import { useState } from 'react'

export default function ProfilePage() {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { context } = useMiniKit()

  const user = context?.user

  const handleImageLoad = () => {
    setTimeout(() => {
      setImageLoaded(true)
    }, 1000)
  }

  return (
    <header className="relative flex flex-col items-center gap-2 p-4 pt-16 text-center">
      <div className="wind-animation relative flex items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 p-2">
        <Avatar className="h-[144px] w-[144px] rounded-full opacity-65">
          <AvatarImage
            className="h-full w-full object-cover"
            src={user?.pfpUrl}
          />
          <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
        </Avatar>
        {imageLoaded && (
          <div className="animate-shine-reflection absolute z-10 h-[25%] w-[200%] -translate-x-1/2 translate-y-1/2 -rotate-45 bg-gradient-to-b from-transparent via-neutral-50/20 to-transparent transition-all"></div>
        )}
      </div>
      <h1 className="mt-2 text-2xl font-medium text-neutral-50">
        {user?.displayName}
      </h1>
      <p className="text-base font-medium text-neutral-200">
        @{user?.username}
      </p>

      <img
        src={user?.pfpUrl}
        alt="winner"
        className="absolute bottom-0 left-0 -z-20 h-full w-full object-cover opacity-30 blur-xs"
        onLoad={handleImageLoad}
      />
      <div className="absolute inset-0 -bottom-1 left-0 -z-10 -mb-1 bg-gradient-to-t from-neutral-900 to-transparent"></div>
    </header>
  )
}
