import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "lemon" | "violet" | "coral" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "lemon",
      size = "md",
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      lemon: "btn-tactile-lemon font-black",
      violet: "btn-tactile-violet font-black",
      coral: "btn-tactile-coral font-black",
      ghost: "btn-tactile-ghost font-bold",
      danger:
        "bg-[#FF6B8A] text-[#2D1B0E] border-2 border-[#2D1B0E] shadow-[0_5px_0_#2D1B0E] active:translate-y-[5px] active:shadow-[0_0px_0_#2D1B0E] hover:bg-[#FF8BA4] font-black",
    };

    const sizeClasses = {
      sm: "h-9 px-3.5 text-xs rounded-full",
      md: "h-12 px-6 text-sm sm:text-base rounded-full",
      lg: "min-h-[58px] py-3.5 px-8 text-base sm:text-lg rounded-full",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 cursor-pointer select-none transition-all disabled:opacity-50 disabled:pointer-events-none disabled:transform-none disabled:shadow-none",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
