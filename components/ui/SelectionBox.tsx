import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectionBoxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  isSelected?: boolean;
  letterChip?: string;
  badge?: string;
  indicatorType?: "check" | "radio" | "none";
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  layout?: "horizontal" | "vertical";
}

export const SelectionBox = React.forwardRef<HTMLButtonElement, SelectionBoxProps>(
  (
    {
      children,
      className,
      isSelected = false,
      letterChip,
      badge,
      indicatorType = "check",
      icon,
      title,
      description,
      layout = "horizontal",
      disabled,
      onClick,
      onKeyDown,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (onKeyDown) {
        onKeyDown(e);
      }
      if (!disabled && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    };

    const isVertical = layout === "vertical";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        role={indicatorType === "radio" ? "radio" : "checkbox"}
        aria-checked={isSelected}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "w-full text-left rounded-2xl border transition-all duration-200 select-none font-sans cursor-pointer outline-none",
          "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
          "active:scale-[0.98]",
          isVertical
            ? "min-h-[96px] p-3 sm:p-4 flex flex-col justify-between gap-2.5"
            : "min-h-[56px] p-4 sm:p-4.5 flex items-center justify-between gap-3",
          isSelected
            ? "border-2 border-[var(--color-plum)] bg-[var(--color-plum)]/15 text-[var(--text-primary)] ring-2 ring-[var(--color-plum)]/30 shadow-[var(--shadow-inset)]"
            : "border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] hover:border-[var(--color-plum)]/30 hover:bg-[var(--card-hover)]",
          disabled && "opacity-50 pointer-events-none cursor-not-allowed",
          className,
        )}
        {...props}
      >
        {isVertical ? (
          /* Vertical Layout: Top row (Icon + Badge/Indicator), Bottom (Title + Description) */
          <>
            <div className="flex items-center justify-between w-full gap-2">
              <div className="shrink-0 flex items-center justify-center">
                {icon}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-plum)]/10 text-[var(--color-plum)]">
                    {badge}
                  </span>
                )}
                {indicatorType === "radio" && (
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 border shrink-0",
                      isSelected
                        ? "border-2 border-[var(--color-plum)] bg-[var(--color-plum)]/10"
                        : "border-[var(--border-strong)] bg-transparent",
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[var(--color-plum)] shadow-xs" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 w-full mt-1">
              {title && (
                <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)] leading-tight line-clamp-2">
                  {title}
                </div>
              )}
              {description && (
                <div className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 leading-tight truncate">
                  {description}
                </div>
              )}
              {children}
            </div>
          </>
        ) : (
          /* Horizontal Layout (Default) */
          <>
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {letterChip && (
                <span
                  className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors",
                    isSelected
                      ? "bg-[var(--color-plum)] text-white shadow-xs"
                      : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]",
                  )}
                  aria-hidden="true"
                >
                  {letterChip}
                </span>
              )}

              {icon && (
                <div className="shrink-0 flex items-center justify-center" aria-hidden="true">
                  {icon}
                </div>
              )}

              <div className="min-w-0 flex-1">
                {title && (
                  <div className="font-bold text-sm sm:text-base text-[var(--text-primary)] leading-snug">
                    {title}
                  </div>
                )}

                {description && (
                  <div className="text-xs text-[var(--text-secondary)] font-medium mt-0.5 leading-normal">
                    {description}
                  </div>
                )}

                {children}
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 ml-2">
              {badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-plum)]/10 text-[var(--color-plum)]">
                  {badge}
                </span>
              )}

              {indicatorType === "check" && (
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                    isSelected
                      ? "bg-[var(--color-plum)] text-white shadow-xs"
                      : "border border-[var(--border-strong)] bg-transparent",
                  )}
                  aria-hidden="true"
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              )}

              {indicatorType === "radio" && (
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 border",
                    isSelected
                      ? "border-2 border-[var(--color-plum)] bg-[var(--color-plum)]/10"
                      : "border-[var(--border-strong)] bg-transparent",
                  )}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-plum)] shadow-xs" />
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </button>
    );
  },
);

SelectionBox.displayName = "SelectionBox";
