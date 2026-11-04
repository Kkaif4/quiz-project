import React from "react";
import { cn } from "@/lib/utils";

export interface StickerPillProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  emoji?: string;
  label: string;
}

export const StickerPill = ({
  className,
  selected = false,
  emoji,
  label,
  ...props
}: StickerPillProps) => {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 text-sm font-black transition-all cursor-pointer select-none",
        selected
          ? "bg-[#FFB830] text-[#2D1B0E] border-[#E09800] shadow-[0_3px_0_#E09800] -translate-y-0.5"
          : "bg-[var(--card-bg)] text-[var(--text-secondary)] border-[var(--card-border)] hover:border-[#FFB830]/50 active:translate-y-0.5",
        className
      )}
      {...props}
    >
      {emoji && <span className="text-base">{emoji}</span>}
      <span>{label}</span>
    </button>
  );
};
