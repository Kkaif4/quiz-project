"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <BrandLogo size={32} textClassName="text-base sm:text-lg" />
        </div>
      </header>

      {/* Main Error Card */}
      <main className="max-w-md mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        <div className="card-cozy rounded-3xl p-6 sm:p-8 space-y-6 text-center border border-rose-500/20">
          <div>
            <Image
              src="/Overwhelmed Lemon’s Busy Day.webp"
              alt="Overwhelmed Lemon Mascot"
              width={112}
              height={112}
              priority
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto mb-2 drop-shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Something went sideways!
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              We hit an unexpected snag while loading this page. Don&apos;t worry, your progress is safe.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="btn-primary-cozy w-full"
            >
              <RefreshCw className="w-5 h-5 text-white/90" />
              <span>Try Again</span>
            </button>

            <Link
              href="/"
              className="btn-secondary-cream w-full"
            >
              <Home className="w-5 h-5 text-[var(--accent-plum)]" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-6 text-center text-xs text-[var(--text-muted)]">
        LemonQuiz &copy; {new Date().getFullYear()} &bull; Cozy &amp; Safe Social Web
      </footer>
    </div>
  );
}
