import React from "react";

export default function ResultLoading() {
  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-between">
      {/* Navbar skeleton */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 animate-pulse" />
            <div className="h-6 w-24 bg-violet-500/20 rounded-lg animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-violet-500/15 rounded-xl animate-pulse" />
        </div>
      </header>

      {/* Result Trophy Card Skeleton */}
      <main className="max-w-xl mx-auto px-4 py-8 w-full space-y-6 flex-1 flex flex-col justify-center">
        <div className="card-surface rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-center flex flex-col items-center">
          {/* Trophy badge skeleton */}
          <div className="w-24 h-24 rounded-full bg-violet-500/20 animate-pulse mx-auto" />

          {/* Score number skeleton */}
          <div className="h-12 w-32 bg-violet-500/20 rounded-2xl animate-pulse" />

          {/* Verdict pill skeleton */}
          <div className="h-8 w-44 bg-violet-500/15 rounded-full animate-pulse" />

          {/* Description skeleton */}
          <div className="h-4 w-3/4 bg-violet-500/10 rounded animate-pulse" />

          {/* Primary CTA Skeleton */}
          <div className="h-14 w-full bg-violet-500/25 rounded-2xl animate-pulse mt-4" />

          {/* Secondary CTA Skeleton */}
          <div className="h-14 w-full bg-violet-500/15 rounded-2xl animate-pulse" />
        </div>
      </main>

      {/* Footer skeleton */}
      <footer className="border-t border-[var(--border-subtle)] py-6 text-center">
        <div className="h-4 w-32 bg-violet-500/15 rounded mx-auto animate-pulse" />
      </footer>
    </div>
  );
}
