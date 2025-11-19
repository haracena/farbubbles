'use client'
import { useEffect, useState } from 'react'
import { useMiniKit } from '@coinbase/onchainkit/minikit'
import BubblesContainer from '@/components/Bubbles/BubblesContainer'

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit()

  // Initialize the  miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [setFrameReady, isFrameReady])

  return (
    <div className="h-screen w-full pb-10">
      <BubblesContainer maxBubbles={50} />
    </div>
  )
}
