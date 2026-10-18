import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

interface NavbarProps {
  maxWidth?: string;
  showCreateButton?: boolean;
  createButtonText?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
}

export function Navbar({
  maxWidth = "max-w-4xl",
  showCreateButton = true,
  createButtonText = "Create Quiz",
  leftElement,
  rightElement,
  className,
}: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-[var(--bg-primary)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto px-4 h-16 flex items-center justify-between gap-3",
          maxWidth,
        )}
      >
        <div className="flex items-center gap-3">
          {leftElement}
          <BrandLogo size={32} textClassName="text-base sm:text-lg" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {rightElement}

          {showCreateButton && !rightElement && (
            <Link
              href="/create"
              className="btn-primary-cozy py-2 px-3.5 sm:px-4 text-xs sm:text-sm shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-white/90" />
              <span>{createButtonText}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
