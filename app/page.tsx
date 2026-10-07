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
  PenLine,
  Lock,
  Send,
} from "lucide-react";
import { Suspense } from "react";
import { getQuizzesByOwnerTokens } from "@/lib/quiz";
import { MyQuizzesSection } from "@/components/dashboard/MyQuizzesSection";
import { FaqSection, FAQ_ITEMS } from "@/components/home/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBaseUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Lemon Quiz Maniac — How Well Do Your Friends Really Know You?",
  description:
    "Create your personalized friendship test in 60 seconds, share with friends, and see who knows you best.",
  keywords: [
    "quize",
    "lemon quize meniac",
    "lemon quize maniac",
    "lemon quiz maniac",
    "lemonquize",
    "lemon quiz",
    "lemonquiz",
    "friendship quiz",
    "bff test 2026",
    "how well do your friends know you",
    "best friend quiz",
    "buddy meter",
    "dare quiz 2026",
    "trivia for friends",
    "buzzfeed quizzes",
    "quotev friendship quiz",
    "uquiz bff",
    "sporcle friends",
    "hola quiz",
    "mate quiz",
    "fun quizzes for friends",
    "friendship dare",
    "true or false best friend",
    "custom quiz maker",
  ],
  alternates: {
    canonical: "/",
  },
  verification: {
    google: [
      "n5AkShKw4YoZg6t4zt9dWVtyoSMiILKGoXLicsx4RVI",
      "CzY4LArjfmtusUoJx74s6pssE-zwo4UiT_fJvJGoYLQ",
      "CUJwVLOe6GlodleCrDikkTAsHdO-W4cOzrkScyBEN4M",
    ],
  },
  other: {
    "google-adsense-account": "ca-pub-6625500498736052",
  },
};

/**
 * Dynamic streaming Server Component for returning user quizzes.
 * Wrapped in Suspense so the marketing hero and CTAs stream immediately.
 */
async function OwnerQuizzesLoader() {
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

  return <MyQuizzesSection serverQuizzes={serverQuizzes} />;
}

export default function HomePage() {
  const baseUrl = getBaseUrl();

  const homepageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "LemonQuiz",
        description:
          "The #1 friendship test and BFF challenge. Create your quiz in 60s and see how well friends know you.",
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/q/{search_term_string}`,
          "query-input": "required name=search_term_string",
        },
        inLanguage: "en-US",
      },
      {
        "@type": "WebApplication",
        "@id": `${baseUrl}/#webapp`,
        name: "LemonQuiz Friendship Test",
        url: baseUrl,
        applicationCategory: "GameApplication",
        operatingSystem: "All",
        browserRequirements: "Requires modern web browser with HTML5 support",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Fast, free friendship quiz generator. Create personalized 60-second trivia tests for friends and view real-time leaderboards.",
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col">
      {/* Search Engine Structured Data */}
      <JsonLd data={homepageSchema} />

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
        {/* Returning User Dashboard Drawer ("My Quizzes") - Streamed asynchronously */}
        <Suspense fallback={null}>
          <OwnerQuizzesLoader />
        </Suspense>

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

            {/* Semantic Paragraph instead of h2 to preserve document hierarchy */}
            <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-snug">
              What is my absolute go-to comfort food late at night?
            </p>

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

        {/* How to Create in 3 Simple Steps */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest block">
              Easy 60-Second Setup
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              How to Create Your Friendship Test in 3 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="card-surface rounded-3xl p-6 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-xs">
                <PenLine className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[var(--text-primary)]">
                1. Pick or Write Questions
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                Choose from our curated friendship templates or customize your
                own questions about your pet peeves, dream spots, and secrets.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-surface rounded-3xl p-6 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[var(--text-primary)]">
                2. Set Your Secret Answers
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                Lock in the correct answers only you know. Scoring is encrypted
                and verified server-side so nobody can cheat.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-surface rounded-3xl p-6 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xs">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[var(--text-primary)]">
                3. Drop Link in Group Chats
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                Share your custom link or QR code to WhatsApp, Instagram
                Stories, or Snapchat. Watch live scores roll in!
              </p>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest block">
              Built for Close Friends
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Why Close Friends Love LemonQuiz: Simple, Fast &amp;
              Ultra-Engaging
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="card-surface rounded-3xl p-6 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-xs">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[var(--text-primary)]">
                Zero Login Required
              </h3>
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
              <h3 className="text-base font-black text-[var(--text-primary)]">
                Real-Time Leaderboard
              </h3>
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
              <h3 className="text-base font-black text-[var(--text-primary)]">
                One-Click Social Sharing
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                Instant WhatsApp invite pre-filling and scannable QR codes for
                seamless Instagram Stories and group chat drops.
              </p>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <FaqSection />

        {/* Bottom Banner CTA */}
        <section className="card-surface rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl border border-violet-500/30 glow-purple">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Ready in under a minute</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Who in your squad actually knows you best?
          </h2>

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
