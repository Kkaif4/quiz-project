import React from "react";
import { Heart, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  maxWidth?: string;
  className?: string;
}

export function Footer({ maxWidth = "max-w-4xl", className }: FooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/70 py-6 text-center text-xs text-[var(--text-muted)] mt-auto",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3",
          maxWidth,
        )}
      >
        <div className="flex items-center gap-2 font-bold text-[var(--text-secondary)]">
          <Heart className="w-3.5 h-3.5 text-[var(--accent-rose)] fill-[var(--accent-rose)]" />
          <span>LemonQuiz &bull; Cozy &amp; Teen-Safe Social Web</span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-plum)]" />
          <span>Zero personal data collected</span>
        </div>
      </div>
    </footer>
  );
}
