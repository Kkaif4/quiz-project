import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | null;
  icon?: React.ReactNode;
  addonRight?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, addonRight, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 text-[var(--text-muted)] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-14 bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-semibold rounded-2xl text-base px-4 transition-all outline-none",
              "focus:border-[#FFB830] focus:ring-4 focus:ring-[#FFB830]/20",
              error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : undefined,
              icon ? "pl-11" : undefined,
              addonRight ? "pr-14" : undefined,
              className
            )}
            {...props}
          />
          {addonRight && (
            <div className="absolute right-4 flex items-center">
              {addonRight}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-bold text-rose-400 pl-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
