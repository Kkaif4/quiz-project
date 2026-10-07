import React from "react";
import Link from "next/link";
import { Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function NotFound() {
  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-between">
      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b-2 border-[var(--border-subtle)]">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center group">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border-2 border-[#2D1B0E] shadow-[0_3px_0_#2D1B0E] group-hover:-translate-y-0.5 group-hover:shadow-[0_4px_0_#2D1B0E] active:translate-y-[2px] active:shadow-[0_0px_0_#2D1B0E] transition-all">
              <span className="text-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">🍋</span>
              <span className="font-black tracking-tight text-base sm:text-lg">
                <span className="text-[#2D1B0E]">Lemon</span><span className="text-[#FF6B8A]">Quiz</span>
              </span>
            </div>
          </Link>
          <Link href="/create">
            <Button variant="lemon" size="sm">
              <Plus className="w-3.5 h-3.5 text-[#2D1B0E]" />
              <span>Create Quiz</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main 404 Container */}
      <main className="max-w-md mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        <div className="card-surface rounded-3xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#FACC15]/15 border-2 border-[#FACC15]/30 flex items-center justify-center text-4xl mx-auto shadow-inner animate-bounce">
            🛸
          </div>

          <div className="space-y-2">
            <div className="flex justify-center">
              <Badge variant="lemon" tilt="left">
                404 Page Not Found
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Lost in the Squad Void?
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              The quiz code, attempt, or secret link you followed doesn&apos;t exist or was archived by the creator.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link href="/create" className="block">
              <Button variant="lemon" size="lg" fullWidth>
                <Plus className="w-5 h-5 text-[#150E28]" />
                <span>Create Your Own Quiz 🚀</span>
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="ghost" size="lg" fullWidth>
                <Home className="w-5 h-5 text-[#C084FC]" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[var(--border-subtle)] py-6 text-center text-xs text-[var(--text-muted)]">
        LemonQuiz &copy; {new Date().getFullYear()} 🍋
      </footer>
    </div>
  );
}
