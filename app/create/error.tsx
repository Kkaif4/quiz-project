"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

export default function CreateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Quiz creation wizard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-between">
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <span className="font-extrabold text-[var(--text-primary)] tracking-tight">
            LemonQuiz
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        <div className="card-surface rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-center border border-red-500/20">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto shadow-xs">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Quiz Builder Error
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              We encountered a glitch while initializing the quiz editor. Click below to reload the wizard.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full min-h-[56px] py-4 px-5 rounded-2xl bg-gradient-cta text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-xs glow-purple hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retry Quiz Builder</span>
            </button>

            <Link
              href="/"
              className="w-full min-h-[56px] py-4 px-5 rounded-2xl bg-violet-500/15 border border-violet-500/25 text-[var(--text-primary)] font-bold text-base flex items-center justify-center gap-2 hover:bg-violet-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-violet-400" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border-subtle)] py-6 text-center text-xs text-[var(--text-muted)]">
        LemonQuiz &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
