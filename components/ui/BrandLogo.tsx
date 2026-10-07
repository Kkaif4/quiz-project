import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /** Size in pixels (applies to width & height of the icon) */
  size?: number;
  /** Whether to show the text label "LemonQuiz" */
  showText?: boolean;
  /** Custom text size class */
  textClassName?: string;
  /** Optional tagline beneath brand name */
  subtitle?: string;
  /** Wrap in a Next.js Link pointing to href (default "/") */
  href?: string | null;
  /** Extra container class */
  className?: string;
  /** Glowing halo effect */
  glow?: boolean;
}

export function BrandLogo({
  size = 34,
  showText = true,
  textClassName = "text-base sm:text-lg",
  subtitle,
  href = "/",
  className,
  glow = true,
}: BrandLogoProps) {
  const content = (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 transition-transform active:scale-[0.98] group select-none",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-105",
          glow && "shadow-sm shadow-amber-900/10 hover:shadow-md",
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src="/brand-lemon-icon.svg"
          alt="LemonQuiz Logo"
          width={size}
          height={size}
          className="w-full h-full object-contain rounded-2xl"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-black text-[var(--text-primary)] tracking-tight transition-colors group-hover:text-[var(--color-plum)]",
              textClassName,
            )}
          >
            LemonQuiz
          </span>
          {subtitle && (
            <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
