import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Home } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function NotFound() {
  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-between">
      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <BrandLogo size={32} textClassName="text-base sm:text-lg" />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/create"
              className="btn-primary-cozy py-1.5 px-3.5 text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Quiz</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main 404 Container */}
      <main className="max-w-md mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        <div className="card-cozy rounded-3xl p-6 sm:p-8 space-y-6 text-center">
          <div>
            <Image
              src="/Overwhelmed Lemon’s Busy Day.webp"
              alt="Lost Lemon Mascot"
              width={128}
              height={128}
              priority
              className="w-28 h-28 sm:w-32 sm:h-32 object-contain mx-auto mb-2 drop-shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
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
              className="btn-premium-gold w-full"
            >
              <Plus className="w-5 h-5 text-[#8A5B17]" />
              <span>Create Your Own Quiz</span>
            </Link>

            <Link
              href="/"
              className="btn-secondary-cream w-full"
            >
              <Home className="w-5 h-5 text-[var(--accent-plum)]" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-6 text-center text-xs text-[var(--text-muted)]">
        LemonQuiz &copy; {new Date().getFullYear()} &bull; Cozy &amp; Safe Social Web
      </footer>
    </div>
  );
}
