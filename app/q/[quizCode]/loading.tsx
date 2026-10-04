import React from "react";

export default function QuizPlayerLoading() {
  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-between">
      {/* Navbar skeleton */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 animate-pulse" />
            <div className="h-6 w-24 bg-violet-500/20 rounded-lg animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-violet-500/15 rounded-xl animate-pulse" />
        </div>
      </header>

      {/* Player Card Skeleton */}
      <main className="max-w-xl mx-auto px-4 py-8 w-full space-y-6 flex-1 flex flex-col justify-center">
        {/* Progress skeleton */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-violet-500/20 rounded animate-pulse" />
            <div className="h-4 w-12 bg-violet-500/20 rounded animate-pulse" />
          </div>
          <div className="h-2.5 w-full bg-violet-500/10 rounded-full animate-pulse" />
        </div>

        {/* Question Deck Card skeleton */}
        <div className="card-surface rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="h-8 w-4/5 bg-violet-500/20 rounded-2xl animate-pulse" />

          {/* Options skeleton */}
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 w-full bg-violet-500/10 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer skeleton */}
      <footer className="border-t border-[var(--border-subtle)] py-6 text-center">
        <div className="h-4 w-32 bg-violet-500/15 rounded mx-auto animate-pulse" />
      </footer>
    </div>
  );
}
