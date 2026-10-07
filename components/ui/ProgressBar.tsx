import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export const ProgressBar = ({ current, total, className }: ProgressBarProps) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
        <span>Question {current} of {total}</span>
        <span className="text-[#FFB830]">{percentage}%</span>
      </div>
      <div className="w-full h-3.5 bg-[var(--card-bg)] rounded-full overflow-hidden border-2 border-[var(--card-border)] p-0.5 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FFB830] via-[#FF6B8A] to-[#B47AFF] transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
