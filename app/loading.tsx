import React from "react";

export default function RootLoading() {
  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-between">
      {/* Top Navbar Skeleton */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b-2 border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FACC15]/20 animate-pulse" />
            <div className="h-6 w-28 bg-[#FACC15]/20 rounded-lg animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-[#FACC15]/20 rounded-xl animate-pulse" />
        </div>
      </header>

      {/* Hero Section Skeleton */}
      <main className="max-w-3xl mx-auto px-4 pt-12 pb-16 w-full space-y-8 flex-1">
        <div className="text-center space-y-4 flex flex-col items-center">
          <div className="h-7 w-48 bg-[#FACC15]/15 rounded-full animate-pulse" />
          <div className="h-12 w-3/4 bg-white/10 rounded-2xl animate-pulse" />
          <div className="h-5 w-2/3 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-14 w-64 bg-[#FACC15]/30 rounded-2xl animate-pulse mt-4" />
        </div>

        {/* Feature Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-surface rounded-3xl p-6 space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#FACC15]/20 animate-pulse" />
              <div className="h-5 w-32 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="border-t-2 border-[var(--border-subtle)] py-8 text-center">
        <div className="h-4 w-40 bg-white/10 rounded mx-auto animate-pulse" />
      </footer>
    </div>
  );
}
