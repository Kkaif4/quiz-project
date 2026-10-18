import React from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "elevated" | "flat" | "interactive";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  as?: "div" | "article" | "section";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, variant = "default", as: Component = "div", ...props }, ref) => {
    const variantStyles: Record<CardVariant, string> = {
      default:
        "bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-card)]",
      elevated:
        "bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-card-hover)]",
      flat:
        "bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-none",
      interactive:
        "bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-card)] hover:border-[var(--color-plum)]/30 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] cursor-pointer",
    };

    return (
      <Component
        ref={ref}
        className={cn(
          "rounded-3xl p-5 sm:p-7 transition-all duration-200 text-[var(--text-primary)]",
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);
Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-start justify-between gap-4 mb-4", className)}
        {...props}
      >
        <div className="space-y-1">{children}</div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  },
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ children, className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        "font-sans text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
});
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
});
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  );
});
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3", className)}
      {...props}
    >
      {children}
    </div>
  );
});
CardFooter.displayName = "CardFooter";
