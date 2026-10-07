import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Crown,
  Plus,
  PenLine,
  Lock,
  Send,
  Users,
  Flame,
} from "lucide-react";
import { Suspense } from "react";
import { getQuizzesByOwnerTokens } from "@/lib/quiz";
import { MyQuizzesSection } from "@/components/dashboard/MyQuizzesSection";
import { FaqSection, FAQ_ITEMS } from "@/components/home/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBaseUrl } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InteractiveHeroTeaser } from "@/components/home/InteractiveHeroTeaser";

export const metadata: Metadata = {
  title: "LemonQuiz — How Well Do Your Friends Really Know You?",
  description:
    "Create your personalized friendship test in 60 seconds, share with friends, and see who knows you best.",
  alternates: {
    canonical: "/",
  },
  verification: {
    google: [
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
          (t): t is string => typeof t === "string" && t.length > 0
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
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col bg-dot-grid relative">
      {/* Search Engine Structured Data */}
      <JsonLd data={homepageSchema} />

      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b-2 border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center group">
            <div className="flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white border-2 border-[#2D1B0E] shadow-[0_4px_0_#2D1B0E] group-hover:-translate-y-1 group-hover:shadow-[0_6px_0_#2D1B0E] active:translate-y-[2px] active:shadow-[0_0px_0_#2D1B0E] transition-all">
              <span className="text-xl sm:text-2xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">🍋</span>
              <span className="font-black tracking-tight text-lg sm:text-xl">
                <span className="text-[#2D1B0E]">Lemon</span><span className="text-[#FF6B8A]">Quiz</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/create">
              <Button variant="lemon" size="md">
                <Plus className="w-4 h-4 text-[#2D1B0E]" />
                <span>Create Quiz ✨</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-6 sm:pt-10 pb-20 space-y-12 sm:space-y-16">
        {/* Returning User Dashboard Drawer */}
        <Suspense fallback={null}>
          <OwnerQuizzesLoader />
        </Suspense>

        {/* ===================================================================
            HERO SECTION: 2-Column Layout with Floating Banter Stickers
            =================================================================== */}
        <section className="relative pt-4 sm:pt-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Column: Punchy Game Hook & Primary CTA */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Squad Activity Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFB830]/15 border-2 border-[#FFB830]/40 text-[#E67700] text-xs sm:text-sm font-black shadow-xs rotate-[-1deg]">
                <Flame className="w-4 h-4 text-[#FF6B8A] fill-[#FF6B8A]" />
                <span>✨ #1 VIRAL FRIENDSHIP CHALLENGE 💖</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[var(--text-primary)] tracking-tighter leading-[1.05] drop-shadow-sm">
                How well do your friends{" "}
                <span className="block mt-2 bg-gradient-to-r from-[#FFB830] via-[#FF6B8A] to-[#B47AFF] bg-clip-text text-transparent filter drop-shadow-md">
                  really know you?
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl font-semibold text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Create a 60-second quiz about your quirks, cravings, and secret habits. Send the link to your squad and watch who gets crowned MVP and who gets roasted! 🍋
              </p>

              {/* Action Area */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/create" className="w-full sm:w-auto">
                  <Button variant="lemon" size="lg" className="w-full sm:w-auto px-10 py-5 text-xl hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6 text-[#2D1B0E]" />
                    <span>Create Your Quiz in 60s ✨</span>
                    <ArrowRight className="w-6 h-6 text-[#2D1B0E]" />
                  </Button>
                </Link>
              </div>

              {/* Quick Trust / Viral Stats Strip */}
              <div className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-sm font-black text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <span>Takes 45 seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <span>Zero Login Required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🏆</span>
                  <span>Live Squad Leaderboard</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Playable Teaser */}
            <div className="lg:col-span-6 w-full max-w-lg mx-auto lg:max-w-none transform lg:rotate-3 lg:hover:rotate-0 transition-all duration-300">
              <InteractiveHeroTeaser />
            </div>
          </div>
        </section>

        {/* ===================================================================
            SQUAD PODIUM TEASER: Visual Preview of the Ranking System
            =================================================================== */}
        <section className="card-surface rounded-3xl p-6 sm:p-8 space-y-6 border-2 border-[var(--card-border)] shadow-[6px_6px_0px_#FFD4B3]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Badge variant="lemon" tilt="left" className="text-sm px-4 py-1.5">
                  <span>Live Squad Podium 🏆</span>
                </Badge>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mt-1">
                See who reigns supreme on your leaderboard
              </h2>
            </div>
            <Link href="/create">
              <Button variant="ghost" size="sm">
                <span>Start Your Board 👑</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* 3-Column Podium Mockup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* 1st Place MVP */}
            <div className="p-5 rounded-2xl bg-[#FFB830]/10 border-2 border-[#FFB830] shadow-[0_4px_0_#E09800] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFB830] text-[#2D1B0E] font-black text-2xl flex items-center justify-center shadow-xs">
                  👑
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#E67700] block">
                    1ST PLACE • MVP
                  </span>
                  <h3 className="font-black text-[var(--text-primary)] text-base">
                    Sarah (Soulmate)
                  </h3>
                </div>
              </div>
              <Badge variant="lemon">10/10 🔮</Badge>
            </div>

            {/* 2nd Place */}
            <div className="p-5 rounded-2xl bg-[var(--card-bg)] border-2 border-[var(--card-border)] shadow-[var(--shadow-tactile)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8E0F0] text-[#6B5344] font-black text-2xl flex items-center justify-center">
                  🥈
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[var(--text-muted)] block">
                    2ND PLACE • BFF
                  </span>
                  <h3 className="font-black text-[var(--text-primary)] text-base">
                    Alex (Real One)
                  </h3>
                </div>
              </div>
              <Badge variant="mint">8/10 ⚡</Badge>
            </div>

            {/* 3rd Place */}
            <div className="p-5 rounded-2xl bg-[var(--card-bg)] border-2 border-[var(--card-border)] shadow-[var(--shadow-tactile)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFE4CC] text-[#6B5344] font-black text-2xl flex items-center justify-center">
                  🥉
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#E67700] block">
                    3RD PLACE • HOMIE
                  </span>
                  <h3 className="font-black text-[var(--text-primary)] text-base">
                    Liam (Homie)
                  </h3>
                </div>
              </div>
              <Badge variant="violet">6/10 🤝</Badge>
            </div>
          </div>
        </section>

        {/* ===================================================================
            HOW IT WORKS: 3 Simple Steps
            =================================================================== */}
        <section className="space-y-6 pt-2">
          <div className="text-center space-y-1">
            <span className="text-xs font-black text-[#E67700] uppercase tracking-widest block">
              Easy 60-Second Setup ⚡
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              How to Test Your Friends in 3 Easy Steps 💕
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="card-surface rounded-3xl p-6 space-y-3 border-2 border-[var(--card-border)] shadow-[var(--shadow-tactile)] hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-[#FFB830]/15 border-2 border-[#FFB830]/30 flex items-center justify-center text-2xl">
                ✏️
              </div>
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                1. Pick or Write Questions
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] leading-relaxed">
                Choose from curated squad templates or write questions about your quirks, red flags, and 3 AM habits. 🌙
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-surface rounded-3xl p-6 space-y-3 border-2 border-[var(--card-border)] shadow-[var(--shadow-tactile)] hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B8A]/15 border-2 border-[#FF6B8A]/30 flex items-center justify-center text-2xl">
                🔐
              </div>
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                2. Set Secret Answers
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] leading-relaxed">
                Lock in your true answers. Scoring is verified strictly server-side so nobody in the squad can cheat. 🤫
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-surface rounded-3xl p-6 space-y-3 border-2 border-[var(--card-border)] shadow-[var(--shadow-tactile)] hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-[#B47AFF]/15 border-2 border-[#B47AFF]/30 flex items-center justify-center text-2xl">
                📱
              </div>
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                3. Drop in Group Chats
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] leading-relaxed">
                Drop your link in WhatsApp, Instagram Stories, or Snapchat. Watch live scores and roasts roll in! 🎉
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FaqSection />

        {/* Bottom CTA Banner */}
        <section className="text-center py-12 px-6 rounded-3xl card-surface space-y-5 border-2 border-[#FFB830]/40 shadow-[6px_6px_0px_#FFD4B3] bg-gradient-to-r from-[#FFFBF5] via-[#FFF5EB] to-[#FFFBF5]">
          <div className="w-16 h-16 rounded-3xl bg-[#FFB830] text-[#2D1B0E] font-black text-3xl flex items-center justify-center mx-auto shadow-[0_4px_0_#E09800] animate-bounce">
            🍋
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Ready to test your squad? 💖
          </h2>
          <p className="text-base sm:text-lg font-semibold text-[var(--text-secondary)] max-w-md mx-auto">
            Build your personalized quiz in 60 seconds and see who your real besties are. ✨
          </p>
          <div className="pt-4">
            <Link href="/create">
              <Button variant="lemon" size="lg" className="px-10 py-5 text-xl hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 text-[#2D1B0E]" />
                <span>Create Your Quiz Now ✨</span>
                <ArrowRight className="w-6 h-6 text-[#2D1B0E]" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer className="border-t-2 border-[var(--border-subtle)] bg-[var(--bg-primary)] py-8 text-center text-xs font-semibold text-[var(--text-muted)] space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span>LemonQuiz © {new Date().getFullYear()}</span>
          <span>•</span>
          <span>Anonymous &amp; Secure 🔒</span>
        </div>
        <p className="text-[11px] text-[var(--text-muted)]">
          The #1 Viral Friendship Quiz for Group Chats &amp; Stories 🍋💕
        </p>
      </footer>
    </div>
  );
}
