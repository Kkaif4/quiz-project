import React from "react";

export default function ManageLoading() {
  return (
    <div className="min-h-screen text-[var(--text-primary)] pb-16">
      {/* Skeleton Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="h-6 w-24 bg-violet-500/15 rounded-lg animate-pulse" />
          <div className="h-8 w-32 bg-violet-500/15 rounded-xl animate-pulse" />
          <div className="h-8 w-20 bg-violet-500/15 rounded-lg animate-pulse" />
        </div>
      </header>

      {/* Main Skeleton Content */}
      <main className="max-w-3xl mx-auto px-4 pt-6 sm:pt-8 space-y-6">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-36 bg-violet-500/20 rounded-full animate-pulse" />
          <div className="h-9 w-3/4 bg-violet-500/15 rounded-2xl animate-pulse" />
          <div className="h-4 w-1/2 bg-violet-500/10 rounded-lg animate-pulse" />
        </div>

        {/* 4 Metrics Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="card-surface rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-7 w-14 bg-violet-500/15 rounded-lg animate-pulse" />
                <div className="h-3 w-20 bg-violet-500/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Quiz Controls Skeleton */}
        <div className="card-surface rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-violet-500/15 rounded animate-pulse" />
                <div className="h-3.5 w-48 bg-violet-500/10 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-14 w-40 bg-violet-500/15 rounded-2xl animate-pulse" />
          </div>
        </div>

        {/* Share Hub Skeleton */}
        <div className="card-surface rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="h-6 w-40 bg-violet-500/20 rounded animate-pulse" />
          <div className="h-14 w-full bg-violet-500/15 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-14 bg-violet-500/15 rounded-2xl animate-pulse" />
            <div className="h-14 bg-violet-500/15 rounded-2xl animate-pulse" />
          </div>
        </div>

        {/* Leaderboard Skeleton */}
        <div className="card-surface rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="h-6 w-44 bg-violet-500/20 rounded animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 w-full bg-violet-500/10 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
