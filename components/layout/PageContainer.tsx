import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type ContainerMaxWidth = "sm" | "md" | "lg" | "xl" | "full";
export type ContainerTexture = "paper" | "grain" | "none";
export type ContainerPadding = "none" | "sm" | "md" | "lg";

export interface PageContainerProps extends React.HTMLAttributes<HTMLElement> {
  maxWidth?: ContainerMaxWidth;
  texture?: ContainerTexture;
  padding?: ContainerPadding;
  as?: "main" | "div" | "section" | "article";
}

export const PageContainer = React.forwardRef<HTMLElement, PageContainerProps>(
  (
    {
      children,
      className,
      maxWidth = "md",
      texture = "paper",
      padding = "md",
      as: Component = "main",
      ...props
    },
    ref,
  ) => {
    const maxWidthStyles: Record<ContainerMaxWidth, string> = {
      sm: "max-w-xl",
      md: "max-w-2xl",
      lg: "max-w-4xl",
      xl: "max-w-5xl",
      full: "max-w-full",
    };

    const paddingStyles: Record<ContainerPadding, string> = {
      none: "p-0",
      sm: "px-3.5 sm:px-4 py-4 sm:py-6",
      md: "px-4 sm:px-6 py-6 sm:py-10",
      lg: "px-4 sm:px-8 py-8 sm:py-14",
    };

    return (
      <Component
        // @ts-expect-error - Polymorphic ref casting
        ref={ref}
        className={cn(
          "relative w-full mx-auto flex-1 text-[var(--text-primary)] min-w-0",
          maxWidthStyles[maxWidth],
          paddingStyles[padding],
          className,
        )}
        {...props}
      >
        {/* Subtle Ambient Texture Background Layer (Optimized for FE Performance) */}
        {texture === "paper" && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-5 opacity-[0.035] dark:opacity-[0.02] overflow-hidden transform-gpu"
          >
            <Image
              src="/texture-warm-paper.webp"
              alt=""
              fill
              quality={40}
              className="object-cover"
              priority={false}
            />
          </div>
        )}

        {texture === "grain" && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-5 opacity-[0.03] dark:opacity-[0.02] overflow-hidden transform-gpu"
          >
            <Image
              src="/texture-subtle-grain.webp"
              alt=""
              fill
              quality={40}
              className="object-cover"
              priority={false}
            />
          </div>
        )}

        {children}
      </Component>
    );
  },
);

PageContainer.displayName = "PageContainer";
