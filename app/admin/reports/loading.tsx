import React from "react";

export default function AdminReportsLoading() {
  return (
    <div className="min-h-screen text-[var(--text-primary)] pb-16">
      {/* Navbar skeleton */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 animate-pulse" />
            <div className="h-6 w-36 bg-violet-500/20 rounded-lg animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-violet-500/15 rounded-xl animate-pulse" />
        </div>
      </header>

      {/* Main Skeleton Content */}
      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-violet-500/20 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-20 bg-violet-500/15 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Report Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-surface rounded-3xl p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-violet-500/20 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-violet-500/15 rounded animate-pulse" />
              </div>
              <div className="h-5 w-3/4 bg-violet-500/15 rounded-lg animate-pulse" />
              <div className="h-14 w-full bg-violet-500/10 rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
