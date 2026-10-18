import React from "react";
import { cn } from "@/lib/utils";

export type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "small"
  | "caption"
  | "label"
  | "error"
  | "badge";

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: React.ElementType;
  htmlFor?: string;
}

const variantStyles: Record<TypographyVariant, string> = {
  display:
    "font-editorial italic text-3xl sm:text-4xl lg:text-5xl text-[var(--text-primary)] tracking-tight leading-tight",
  h1: "font-sans text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight leading-tight",
  h2: "font-sans text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight leading-snug",
  h3: "font-sans text-base sm:text-lg font-bold text-[var(--text-primary)] leading-snug",
  body: "font-sans text-sm sm:text-base font-normal text-[var(--text-secondary)] leading-relaxed",
  small: "font-sans text-xs sm:text-sm font-medium text-[var(--text-muted)] leading-normal",
  caption: "font-sans text-xs font-semibold text-[var(--text-muted)] leading-tight",
  label: "font-sans text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] leading-tight block mb-2",
  error: "font-sans text-xs font-semibold text-rose-500 dark:text-rose-400 leading-tight mt-1.5 flex items-center gap-1",
  badge: "font-sans text-xs font-bold uppercase tracking-wider text-[var(--color-plum)]",
};

const defaultElementMap: Record<TypographyVariant, React.ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "p",
  small: "p",
  caption: "span",
  label: "label",
  error: "p",
  badge: "span",
};

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ children, className, variant = "body", as, ...props }, ref) => {
    const Component = as || defaultElementMap[variant] || "p";

    return (
      <Component
        ref={ref}
        className={cn(variantStyles[variant], className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);
Typography.displayName = "Typography";

/* Convenient Dedicated Subcomponents */
export function Display({ className, ...props }: TypographyProps) {
  return <Typography variant="display" className={className} {...props} />;
}

export function Heading({
  level = 1,
  className,
  ...props
}: TypographyProps & { level?: 1 | 2 | 3 }) {
  const variant: TypographyVariant = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
  return <Typography variant={variant} className={className} {...props} />;
}

export function Text({ className, ...props }: TypographyProps) {
  return <Typography variant="body" className={className} {...props} />;
}

export function Label({ className, ...props }: TypographyProps) {
  return <Typography variant="label" className={className} {...props} />;
}

export function HelperText({ className, ...props }: TypographyProps) {
  return <Typography variant="small" className={className} {...props} />;
}

export function ErrorText({ className, ...props }: TypographyProps) {
  return <Typography variant="error" className={className} {...props} />;
}
