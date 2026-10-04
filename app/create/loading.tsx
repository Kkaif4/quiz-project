import React from "react";

export default function CreateLoading() {
  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col">
      {/* Header bar skeleton */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="h-6 w-16 bg-violet-500/15 rounded-lg animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 animate-pulse" />
            <div className="h-6 w-24 bg-violet-500/20 rounded-lg animate-pulse" />
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Form Skeleton */}
      <main className="max-w-2xl mx-auto px-4 py-8 w-full space-y-6 flex-1">
        {/* Step indicator skeleton */}
        <div className="h-8 w-44 bg-violet-500/20 rounded-full animate-pulse mx-auto" />

        {/* Card skeleton */}
        <div className="card-surface rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-violet-500/20 rounded animate-pulse" />
            <div className="h-14 w-full bg-violet-500/10 rounded-2xl animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-36 bg-violet-500/20 rounded animate-pulse" />
            <div className="h-24 w-full bg-violet-500/10 rounded-2xl animate-pulse" />
          </div>

          {/* Options skeleton */}
          <div className="space-y-3 pt-2">
            <div className="h-4 w-24 bg-violet-500/20 rounded animate-pulse" />
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 w-full bg-violet-500/10 rounded-2xl animate-pulse"
              />
            ))}
          </div>

          {/* Action button skeleton */}
          <div className="h-14 w-full bg-violet-500/25 rounded-2xl animate-pulse pt-4" />
        </div>
      </main>
    </div>
  );
}
