import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Crown,
  Share2,
  Check,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { getQuizzesByOwnerTokens } from "@/lib/quiz";
import { MyQuizzesSection } from "@/components/dashboard/MyQuizzesSection";

export const metadata: Metadata = {
  title: "LemonQuiz — How Well Do Your Friends Really Know You?",
  description:
    "Create your personalized friendship test in 60 seconds, share with friends, and see who knows you best.",
};

export default async function HomePage() {
  // Read owner tokens from HTTP-only cookies in Next.js 16 Server Component
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get("quiz_owner_tokens")?.value;

  let ownerTokens: string[] = [];
  if (rawCookie) {
    try {
      const parsed = JSON.parse(rawCookie);
      if (Array.isArray(parsed)) {
        ownerTokens = parsed.filter(
          (t): t is string => typeof t === "string" && t.length > 0,
        );
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  const serverQuizzes =
    ownerTokens.length > 0 ? await getQuizzesByOwnerTokens(ownerTokens) : [];

  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/35 flex items-center justify-center text-violet-300 shadow-xs glow-purple">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-[var(--text-primary)] tracking-tight text-lg">
              LemonQuiz
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs sm:text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-xs glow-purple"
            >
              <Plus className="w-4 h-4 text-white/90" />
              <span>Create Quiz</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-8 sm:pt-14 pb-20 space-y-12 sm:space-y-16">
        {/* Returning User Dashboard Drawer ("My Quizzes") */}
        <MyQuizzesSection serverQuizzes={serverQuizzes} />

        {/* Hero Section */}
        <section className="text-center space-y-5 max-w-2xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs sm:text-sm font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>The #1 Friendship Test for Your Squad</span>
          </div>

          {/* Display Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tight leading-[1.08]">
            How well do your friends{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              really know you?
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg font-medium text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
            Create a custom friendship quiz in 60 seconds, send your link to
            group chats or story, and see who reigns supreme on your live
            leaderboard.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/create"
              className="w-full sm:w-auto min-h-[56px] py-4 px-8 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-black text-base shadow-xl shadow-violet-600/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer glow-purple-lg"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Create Your Quiz in 60s</span>
              <ArrowRight className="w-4 h-4 text-white/80" />
            </Link>
          </div>
        </section>

        {/* Mock Interactive Question Preview Card */}
        <section className="max-w-xl mx-auto">
          <div className="card-surface rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_12px_45px_rgb(0,0,0,0.2)] border border-[var(--card-border)] glow-purple">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-violet-300 bg-violet-500/15 border border-violet-500/30 px-3 py-1 rounded-full">
                SAMPLE QUESTION 02
              </span>
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                1 of 6 answered
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-snug">
              What is my absolute go-to comfort food late at night?
            </h2>

            <div className="space-y-2.5 pt-1">
              <div className="p-4 rounded-2xl border-2 border-violet-500 bg-violet-500/20 flex items-center justify-between font-semibold text-sm sm:text-base text-[var(--text-primary)] shadow-xs glow-purple">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-violet-600 text-white text-xs font-black flex items-center justify-center">
                    A
                  </span>
                  <span>Extra spicy instant ramen</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] flex items-center gap-3 font-semibold text-sm sm:text-base text-[var(--text-secondary)]">
                <span className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-black flex items-center justify-center">
                  B
                </span>
                <span>Cheesy garlic bread</span>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] flex items-center gap-3 font-semibold text-sm sm:text-base text-[var(--text-secondary)]">
                <span className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-black flex items-center justify-center">
                  C
                </span>
                <span>Pepperoni pizza with ranch</span>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] flex items-center gap-3 font-semibold text-sm sm:text-base text-[var(--text-secondary)]">
                <span className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-black flex items-center justify-center">
                  D
                </span>
                <span>Cold brew &amp; chocolate cookies</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-1">
            <h2 className="text-xs font-bold text-violet-400 uppercase tracking-widest">
              Built for Close Friends
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Simple, Fast &amp; Ultra-Engaging
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="card-surface rounded-3xl p-6 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-xs">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-[var(--text-primary)]">
                Zero Login Required
              </h4>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                No accounts, no email verification, no passwords. Manage
                everything with an anonymous, secure private link.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-surface rounded-3xl p-6 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-xs">
                <Crown className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-[var(--text-primary)]">
                Real-Time Leaderboard
              </h4>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                Rank your friends on a live podium. See scores, match
                percentages, and question-by-question breakdown answers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-surface rounded-3xl p-6 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xs">
                <Share2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-[var(--text-primary)]">
                One-Click Social Sharing
              </h4>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                Instant WhatsApp invite pre-filling and scannable QR codes for
                seamless Instagram Stories and group chat drops.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Banner CTA */}
        <section className="card-surface rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl border border-violet-500/30 glow-purple">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Ready in under a minute</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Who in your squad actually knows you best?
          </h3>

          <p className="text-sm font-medium text-[var(--text-secondary)] max-w-md mx-auto">
            Pick a template, choose your secret answers, and watch your friends
            compete for the #1 spot on your podium.
          </p>

          <div className="pt-2">
            <Link
              href="/create"
              className="inline-flex min-h-[56px] py-4 px-8 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-black text-base shadow-xl shadow-violet-600/30 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer items-center gap-2 glow-purple-lg"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Create Your Friendship Quiz</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 py-6 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-[var(--text-secondary)]">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>LemonQuiz &bull; Private &amp; Teen-Safe Social Web</span>
          </div>
          <div className="flex items-center gap-1 text-[var(--text-muted)]">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            <span>Zero personal data collected</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
