import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "premium"
  | "ghost"
  | "outline"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "lg",
      fullWidth = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isButtonDisabled = Boolean(disabled || isLoading);

    // Variant style maps
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        "bg-[var(--color-plum)] text-white shadow-[var(--shadow-button)] hover:bg-[var(--color-plum-dark)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
      secondary:
        "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--card-hover)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
      premium:
        "bg-[var(--color-champagne-dark)] text-[#241C24] font-black shadow-[var(--shadow-premium)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
      ghost:
        "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] active:scale-[0.98]",
      outline:
        "bg-transparent border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--card-hover)] active:scale-[0.98]",
      destructive:
        "bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 active:scale-[0.98]",
    };

    // Size style maps (lg enforces the mandatory 56px minimum touch target)
    const sizeStyles: Record<ButtonSize, string> = {
      sm: "min-h-[40px] px-3.5 py-1.5 text-xs font-semibold rounded-xl",
      md: "min-h-[48px] px-4 py-2.5 text-sm font-bold rounded-2xl",
      lg: "min-h-[56px] px-6 py-3.5 text-base font-bold rounded-2xl",
      icon: "w-11 h-11 min-h-[44px] min-w-[44px] p-0 flex items-center justify-center rounded-xl",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isButtonDisabled}
        aria-busy={isLoading}
        aria-disabled={isButtonDisabled}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 font-sans select-none cursor-pointer transition-all duration-200 outline-none",
          "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
          "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
          fullWidth && "w-full",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading && (
          <Loader2
            className={cn(
              "w-4 h-4 animate-spin shrink-0",
              size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
            )}
            aria-hidden="true"
          />
        )}

        {!isLoading && leftIcon && (
          <span className="shrink-0 flex items-center justify-center" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <span className={cn("leading-tight truncate", isLoading && !loadingText && "opacity-80")}>
          {isLoading && loadingText ? loadingText : children}
        </span>

        {!isLoading && rightIcon && (
          <span className="shrink-0 flex items-center justify-center" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
