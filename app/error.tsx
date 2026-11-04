"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b-2 border-[var(--border-subtle)]">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center group">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border-2 border-[#2D1B0E] shadow-[0_3px_0_#2D1B0E] group-hover:-translate-y-0.5 group-hover:shadow-[0_4px_0_#2D1B0E] active:translate-y-[2px] active:shadow-[0_0px_0_#2D1B0E] transition-all">
              <span className="text-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">🍋</span>
              <span className="font-black tracking-tight text-base sm:text-lg">
                <span className="text-[#2D1B0E]">Lemon</span><span className="text-[#FF6B8A]">Quiz</span>
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Error Card */}
      <main className="max-w-md mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        <div className="card-surface rounded-3xl p-6 sm:p-8 space-y-6 text-center border-2 border-rose-500/30">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border-2 border-rose-500/30 flex items-center justify-center text-3xl mx-auto">
            💥
          </div>

          <div className="space-y-2">
            <div className="flex justify-center">
              <Badge variant="coral" tilt="left">
                Something Went Sideways
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Quick hiccup in the lemonade!
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              We hit an unexpected snag loading this page. Don&apos;t worry, your progress is safe.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              type="button"
              variant="lemon"
              size="lg"
              fullWidth
              onClick={() => reset()}
            >
              <RefreshCw className="w-5 h-5 text-[#150E28]" />
              <span>Try Again</span>
            </Button>

            <Link href="/" className="block">
              <Button variant="ghost" size="lg" fullWidth>
                <Home className="w-5 h-5 text-[#C084FC]" />
                <span>Return Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[var(--border-subtle)] py-6 text-center text-xs text-[var(--text-muted)]">
        LemonQuiz &copy; {new Date().getFullYear()} 🍋
      </footer>
    </div>
  );
}
