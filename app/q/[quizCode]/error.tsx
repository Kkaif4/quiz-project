"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Plus, Home } from "lucide-react";

export default function QuizPlayerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Quiz player error:", error);
  }, [error]);

  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-between">
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-[var(--text-primary)] tracking-tight">
            LemonQuiz
          </Link>
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20 hover:bg-violet-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Quiz</span>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        <div className="card-surface rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-center border border-red-500/20">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto shadow-xs">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Couldn&apos;t Load Quiz
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              We couldn&apos;t load the questions for this quiz. It might have ended or had a temporary network hitch.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full min-h-[56px] py-4 px-5 rounded-2xl bg-gradient-cta text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-xs glow-purple hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retry Loading</span>
            </button>

            <Link
              href="/"
              className="w-full min-h-[56px] py-4 px-5 rounded-2xl bg-violet-500/15 border border-violet-500/25 text-[var(--text-primary)] font-bold text-base flex items-center justify-center gap-2 hover:bg-violet-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Home className="w-5 h-5 text-violet-400" />
              <span>Go to Home</span>
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
