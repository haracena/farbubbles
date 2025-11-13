"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useRef } from "react";

interface BubbleProps {
  id: number;
  size: number;
  x: number;
  y: number;
  symbol: string;
  price: number;
  change24h: number;
  iconUrl: string;
  onBubbleClick?: (id: number) => void;
}

export default function Bubble({
  id,
  size,
  x,
  y,
  symbol,
  price,
  change24h,
  iconUrl,
  onBubbleClick,
}: BubbleProps) {
  const pointerDownTime = useRef<number | null>(null);

  function handlePointerDown() {
    pointerDownTime.current = Date.now();
  }

  function handlePointerUp() {
    if (pointerDownTime.current) {
      const duration = Date.now() - pointerDownTime.current;
      // Considera tap si fue menos de 200ms
      if (duration < 200 && onBubbleClick) {
        onBubbleClick(id);
      }
      pointerDownTime.current = null;
    }
  }

  const isPositive = change24h >= 0;
  const baseColor = isPositive ? "#16a34a" : "#dc2626";
  const glowColor = isPositive ? "#34d399" : "#fb7185";
  const textColor = isPositive ? "text-emerald-100" : "text-rose-100";
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: price >= 1 ? 2 : 6,
  }).format(price);
  const formattedChange = `${isPositive ? "+" : ""}${change24h.toFixed(2)}%`;

  return (
    <div
      className="absolute cursor-pointer transition-transform duration-300 ease-out"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: "scale(1)",
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div
        className="w-full h-full rounded-full shadow-lg backdrop-blur-sm relative overflow-hidden active:scale-95 transition-transform duration-300 ease-out flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${glowColor}55, ${baseColor}35)`,
          border: `2px solid ${glowColor}30`,
          boxShadow: `
            inset 0 0 20px ${glowColor}25,
            0 0 25px ${baseColor}30
          `,
        }}
      >
        <div className="flex flex-col items-center justify-center text-white text-center leading-tight px-2 gap-1">
          <img
            src={iconUrl}
            alt={`${symbol} icon`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[90%] object-cover opacity-40"
            // className="size-10 rounded-full"
          />
          <span className="font-bold text-base drop-shadow-sm">{symbol}</span>
          {/* <span className="text-sm opacity-90">{formattedPrice}</span> */}
          <span className={`text-xs font-semibold ${textColor}`}>
            {formattedChange}
          </span>
        </div>
      </div>
    </div>
  );
}
