import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Crown,
  Share2,
  Check,
  Plus,
  
  PenLine,
  Lock,
  Send,
  
} from "lucide-react";
import { Suspense } from "react";
import { getQuizzesByOwnerTokens } from "@/lib/quiz";
import { MyQuizzesSection } from "@/components/dashboard/MyQuizzesSection";
import { FaqSection } from "@/components/home/FaqSection";
import { FAQ_ITEMS } from "@/lib/faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { Footer } from "@/components/layout/Footer";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getBaseUrl } from "@/lib/seo";
import { BrandLogo } from "@/components/ui/BrandLogo";

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
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <BrandLogo size={32} textClassName="text-lg" />

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/create"
              className="btn-primary-cozy py-2 px-3.5 sm:px-4 text-xs sm:text-sm shadow-xs"
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
        <section className="text-center space-y-5 max-w-2xl mx-auto relative mb-10">
          {/* Floating Botanical Side Accents (Hidden on small screens) */}
          <div className="hidden md:block absolute -left-20 top-8 pointer-events-none opacity-80 dark:opacity-40 animate-pulse">
            <Image
              src="/deco-botanical-leaf-left.svg"
              alt=""
              width={96}
              height={128}
              className="w-20 h-auto object-contain"
            />
          </div>
          <div className="hidden md:block absolute -right-20 top-8 pointer-events-none opacity-80 dark:opacity-40 animate-pulse">
            <Image
              src="/deco-botanical-leaf-right.svg"
              alt=""
              width={100}
              height={130}
              className="w-22 h-auto object-contain"
            />
          </div>

          {/* Pill Badge with Floating Accents */}
          <div className="inline-flex items-center gap-2 relative">
            <Image
              src="/deco-heart-rose.svg"
              alt=""
              width={20}
              height={20}
              className="w-6 h-6 object-contain inline-block -mr-1"
            />
            <div className="pill-badge">
              <span>The #1 Friendship Test for Your Circle</span>
            </div>
            <Image
              src="/deco-starburst-champagne.svg"
              alt=""
              width={20}
              height={20}
              className="w-6 h-6 object-contain inline-block -ml-1 animate-spin"
              style={{ animationDuration: "12s" }}
            />
          </div>

          {/* Hero Mascot Illustration (UI-001: Increased size by ~20%) */}
          <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80">
            <Image
              src="/Citrus Best Friends Forever.webp"
              alt="Lemon and Orange Best Friends Mascot"
              width={360}
              height={360}
              priority
              className="w-full h-full mx-auto object-contain drop-shadow-md dark:drop-shadow-[0_4px_20px_rgba(230,200,138,0.20)]"
            />
          </div>

          {/* Display Headline with Editorial Serif Accent */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tight leading-[1.12]">
            How well do your friends{" "}
            <span className="font-editorial italic font-normal text-[var(--accent-plum)] block sm:inline">
              really know you?
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg font-medium text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
            Create a personalized friendship quiz in 60 seconds, share your
            secret link to group chats or stories, and see who takes the crown
            on your live podium.
          </p>

          {/* Primary CTA */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/create"
              className="btn-premium-gold w-full sm:w-auto px-8"
            >
              <Sparkles className="w-5 h-5 text-[#8A5B17]" />
              <span>Create Your Quiz in 60s</span>
              <ArrowRight className="w-4 h-4 text-[#241C24]/70" />
            </Link>
          </div>
        </section>

        {/* Mock Interactive Question Preview Card */}
        <section className="max-w-xl mx-auto">
          <div className="card-cozy rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-[var(--accent-plum)] bg-[var(--accent-plum)]/10 border border-[var(--accent-plum)]/20 px-3 py-1 rounded-full">
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
              <div className="p-4 rounded-2xl border-2 border-[var(--accent-plum)] bg-[var(--accent-plum)]/10 flex items-center justify-between font-semibold text-sm sm:text-base text-[var(--text-primary)] shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[var(--accent-plum)] text-white text-xs font-black flex items-center justify-center shadow-xs">
                    A
                  </span>
                  <span>Extra spicy instant ramen</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-[var(--accent-sage)] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] flex items-center gap-3 font-semibold text-sm sm:text-base text-[var(--text-secondary)]">
                <span className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-black flex items-center justify-center">
                  B
                </span>
                <span>Cheesy garlic bread</span>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] flex items-center gap-3 font-semibold text-sm sm:text-base text-[var(--text-secondary)]">
                <span className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-black flex items-center justify-center">
                  C
                </span>
                <span>Pepperoni pizza with ranch</span>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] flex items-center gap-3 font-semibold text-sm sm:text-base text-[var(--text-secondary)]">
                <span className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-black flex items-center justify-center">
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
            <span className="text-xs font-bold text-[var(--accent-plum)] uppercase tracking-widest block">
              Easy 60-Second Setup
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              How to Create Your Friendship Test in 3 Simple Steps
            </h2>
          </div>

          {/* Polaroid Memory Stack Aesthetic */}
          <div className="flex justify-center my-3">
            <Image
              src="/Warm Memories Photo Stack.webp"
              alt="Warm Memories Photo Stack"
              width={256}
              height={256}
              className="w-48 sm:w-64 mx-auto object-contain rounded-2xl shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="card-cozy rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-plum)]/10 border border-[var(--accent-plum)]/20 flex items-center justify-center text-[var(--accent-plum)] shadow-xs">
                <PenLine className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[var(--text-primary)]">
                1. Pick or Write Questions
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                Choose from our curated friendship presets or customize your own
                questions about pet peeves, dreams, and secrets.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-cozy rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-rose)]/15 border border-[var(--accent-rose)]/25 flex items-center justify-center text-[var(--accent-rose)] shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[var(--text-primary)]">
                2. Set Your Secret Answers
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                Lock in the correct answers only you know. Scoring is calculated
                securely on the server so nobody can inspect the page to cheat.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-cozy rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-lavender)]/20 border border-[var(--accent-lavender)]/30 flex items-center justify-center text-[var(--accent-plum)] shadow-xs">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[var(--text-primary)]">
                3. Share with Your Friends
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                Send your custom link to WhatsApp, Instagram Stories, or group
                chats. Watch real-time scores roll in!
              </p>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-[var(--accent-plum)] uppercase tracking-widest block">
              Built for Close Friends
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Why Close Friends Love LemonQuiz: Simple, Fast &amp;
              Ultra-Engaging
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="card-cozy rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-plum)]/10 border border-[var(--accent-plum)]/20 flex items-center justify-center text-[var(--accent-plum)] shadow-xs">
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
            <div className="card-cozy rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-rose)]/15 border border-[var(--accent-rose)]/25 flex items-center justify-center text-[var(--accent-rose)] shadow-xs">
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
            <div className="card-cozy rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-lavender)]/20 border border-[var(--accent-lavender)]/30 flex items-center justify-center text-[var(--accent-plum)] shadow-xs">
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

        {/* Whimsical Heart Swash Divider */}
        <div className="py-2 text-center" aria-hidden="true">
          <Image
            src="/Whimsical Heart Swash Divider.webp"
            alt=""
            width={256}
            height={64}
            className="w-48 sm:w-64 h-auto mx-auto opacity-70 dark:opacity-40 object-contain"
          />
        </div>

        {/* Frequently Asked Questions */}
        <FaqSection />

        {/* Bottom Banner CTA */}
        <section className="card-cozy rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl border border-[var(--accent-plum)]/20 relative overflow-hidden">
          <div className="mb-2">
            <Image
              src="/Cheerful Dancing Lemon Mascot.webp"
              alt="Cheerful Dancing Lemon Mascot"
              width={80}
              height={80}
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto drop-shadow-xs"
            />
          </div>

          <div className="pill-badge">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-plum)]" />
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
            <Link href="/create" className="btn-premium-gold px-8 inline-flex">
              <Sparkles className="w-5 h-5 text-[#8A5B17]" />
              <span>Create Your Friendship Quiz</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
