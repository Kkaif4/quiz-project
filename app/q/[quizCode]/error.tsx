"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Plus, Home } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

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
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <BrandLogo size={32} textClassName="text-base sm:text-lg" />
          <Link
            href="/create"
            className="btn-primary-cozy py-1.5 px-3.5 text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Quiz</span>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        <div className="card-cozy rounded-3xl p-6 sm:p-8 space-y-6 text-center border border-rose-500/20">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 mx-auto shadow-xs">
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
              className="btn-primary-cozy w-full"
            >
              <RefreshCw className="w-5 h-5 text-white/90" />
              <span>Retry Loading</span>
            </button>

            <Link
              href="/"
              className="btn-secondary-cream w-full"
            >
              <Home className="w-5 h-5 text-[var(--accent-plum)]" />
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border-subtle)] py-6 text-center text-xs text-[var(--text-muted)]">
        LemonQuiz &copy; {new Date().getFullYear()} &bull; Cozy &amp; Safe Social Web
      </footer>
    </div>
  );
}
