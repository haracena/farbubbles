"use client";
import { useEffect, useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import BubblesContainer from "@/components/Bubbles/BubblesContainer";

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Initialize the  miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full min-h-screen bg-neutral-900">
      <div className="w-full h-screen">
        <BubblesContainer maxBubbles={50} />
      </div>
    </div>
  );
}
