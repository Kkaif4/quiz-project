import React from "react";
import { cn } from "@/lib/utils";

interface IconBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "plum" | "gold" | "rose" | "sage" | "lavender";
  className?: string;
}

export function IconBox({
  children,
  size = "md",
  variant = "plum",
  className,
  ...props
}: IconBoxProps) {
  const sizeClasses = {
    sm: "w-8 h-8 rounded-xl",
    md: "w-10 h-10 rounded-2xl",
    lg: "w-12 h-12 rounded-2xl",
  }[size];

  const variantClasses = {
    plum: "bg-[var(--accent-plum)]/10 border border-[var(--accent-plum)]/20 text-[var(--accent-plum)]",
    gold: "bg-[var(--accent-champagne)]/15 border border-[var(--accent-champagne)]/30 text-[var(--accent-champagne-dark)]",
    rose: "bg-[var(--accent-rose)]/15 border border-[var(--accent-rose)]/25 text-[var(--accent-rose)]",
    sage: "bg-[var(--accent-sage)]/15 border border-[var(--accent-sage)]/25 text-[var(--accent-sage)]",
    lavender: "bg-[var(--accent-lavender)]/20 border border-[var(--accent-lavender)]/30 text-[var(--accent-plum)]",
  }[variant];

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 shadow-xs transition-colors",
        sizeClasses,
        variantClasses,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
