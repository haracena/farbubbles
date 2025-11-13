import { Token } from "@/interfaces/Token";
import type { SyntheticEvent } from "react";

interface BubbleModalProps {
  selectedToken: Token;
  onClose: () => void;
}
export default function BubbleModal({
  selectedToken,
  onClose,
}: BubbleModalProps) {
  const handleBackdropInteraction = () => {
    onClose();
  };

  const stopPropagation = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      className="absolute inset-0 z-50"
      role="presentation"
      onClick={handleBackdropInteraction}
      onTouchStart={handleBackdropInteraction}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") {
          handleBackdropInteraction();
        }
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md rounded-lg p-4 text-white border border-white/20 space-y-3"
        role="dialog"
        aria-modal="true"
        onClick={stopPropagation}
        onTouchStart={stopPropagation}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="flex items-center gap-3">
          <img
            src={selectedToken.iconUrl}
            alt={`${selectedToken.symbol} icon`}
            className="size-10 rounded-full border border-white/30 shadow"
          />
          <div>
            <h3 className="text-lg font-bold">
              {selectedToken.name} ({selectedToken.symbol})
            </h3>
            <p className="text-sm opacity-80">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: selectedToken.price >= 1 ? 2 : 6,
              }).format(selectedToken.price)}
            </p>
          </div>
        </div>
        <p
          className={`text-sm font-semibold ${
            selectedToken.change24h >= 0 ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {selectedToken.change24h >= 0 ? "+" : ""}
          {selectedToken.change24h.toFixed(2)}% (24h)
        </p>
        <div className="mt-2 text-xs opacity-75 space-y-1">
          <p>
            Market cap:{" "}
            {new Intl.NumberFormat("en-US", {
              notation: "compact",
              maximumFractionDigits: 2,
            }).format(selectedToken.marketCap)}
          </p>
          <p>
            24h volume:{" "}
            {new Intl.NumberFormat("en-US", {
              notation: "compact",
              maximumFractionDigits: 2,
            }).format(selectedToken.volume24h)}
          </p>
        </div>
      </div>
    </div>
  );
}
