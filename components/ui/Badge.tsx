import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "lemon" | "violet" | "coral" | "mint" | "slate";
  tilt?: "none" | "left" | "right";
}

export const Badge = ({
  className,
  variant = "lemon",
  tilt = "none",
  children,
  ...props
}: BadgeProps) => {
  const variantClasses = {
    lemon: "bg-[#FFB830]/15 border-[#FFB830]/40 text-[#E67700]",
    violet: "bg-[#B47AFF]/15 border-[#B47AFF]/40 text-[#8B50E0]",
    coral: "bg-[#FF6B8A]/15 border-[#FF6B8A]/40 text-[#E0456B]",
    mint: "bg-[#36D399]/15 border-[#36D399]/40 text-[#1EAA78]",
    slate: "bg-[var(--card-border)]/40 border-[var(--card-border)] text-[var(--text-secondary)]",
  };

  const tiltClasses = {
    none: "",
    left: "sticker-tilt-left",
    right: "sticker-tilt-right",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs select-none",
        variantClasses[variant],
        tiltClasses[tilt],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
