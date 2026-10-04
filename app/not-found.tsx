import React from "react";
import Link from "next/link";
import { HelpCircle, Plus, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-between">
      {/* Header bar */}
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

      {/* Main 404 Container */}
      <main className="max-w-md mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        <div className="card-surface rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-center border border-[var(--border-subtle)]">
          <div className="w-20 h-20 rounded-3xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto shadow-xs glow-purple">
            <HelpCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-black tracking-widest text-violet-400 uppercase">
              404 Page Not Found
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Lost in the Lemonade?
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              The quiz code, attempt, or secret link you followed doesn&apos;t exist or has expired.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/create"
              className="w-full min-h-[56px] py-4 px-5 rounded-2xl bg-gradient-cta text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-xs glow-purple hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your Own Quiz</span>
            </Link>

            <Link
              href="/"
              className="w-full min-h-[56px] py-4 px-5 rounded-2xl bg-violet-500/15 border border-violet-500/25 text-[var(--text-primary)] font-bold text-base flex items-center justify-center gap-2 hover:bg-violet-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Home className="w-5 h-5 text-violet-400" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-6 text-center text-xs text-[var(--text-muted)]">
        LemonQuiz &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
