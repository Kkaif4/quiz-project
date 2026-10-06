"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Crown,
  HeartHandshake,
  Flame,
  Share2,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  Heart,
} from "lucide-react";
import type { IAttemptResultDetails } from "@/types/quiz";
import { getFriendshipVerdict } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface QuizResultProps {
  result: IAttemptResultDetails;
}

export function QuizResult({ result }: QuizResultProps) {
  const [copied, setCopied] = useState(false);

  const verdict = getFriendshipVerdict(result.percentage);

  // Trigger celebratory confetti burst with cozy warm palette
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#D1A76A", "#D99A9A", "#B8A5C9", "#6D526F", "#A8B89A"],
        disableForReducedMotion: true,
      });
    } catch (err) {
      console.warn("Confetti animation not triggered:", err);
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const getWhatsAppShareUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const playUrl = `${origin}/q/${result.quizCode}`;
    const message = `I scored ${result.score}/${result.total} (${result.percentage}%) on "${result.quizTitle}"! Can you beat my score? Take the quiz here: ${playUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const renderVerdictIcon = () => {
    switch (verdict.iconName) {
      case "Crown":
        return <Crown className="w-6 h-6 text-[#C99B62]" />;
      case "HeartHandshake":
        return <HeartHandshake className="w-6 h-6 text-[var(--accent-rose)]" />;
      case "Flame":
        return <Flame className="w-6 h-6 text-[#D1A76A]" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6 text-[var(--accent-plum)]" />;
    }
  };

  const renderTierIllustration = (percentage: number) => {
    const pct = Math.max(0, Math.min(100, Math.round(percentage)));

    if (pct >= 90) {
      return (
        <Image
          src="/Joyful Lemon Hugging Golden Star.webp"
          alt="BFF Golden Star Mascot Celebration"
          width={128}
          height={128}
          className="w-28 h-28 sm:w-32 sm:h-32 object-contain mx-auto drop-shadow-md select-none pointer-events-none"
          priority
        />
      );
    }

    if (pct >= 70) {
      return (
        <Image
          src="/Citrus Best Friends Forever.webp"
          alt="Certified Best Friends Mascot"
          width={128}
          height={128}
          className="w-28 h-28 sm:w-32 sm:h-32 object-contain mx-auto drop-shadow-md select-none pointer-events-none"
          priority
        />
      );
    }

    if (pct >= 40) {
      return (
        <Image
          src="/Cozy Lemon Study Moment.webp"
          alt="Study Moment Lemon"
          width={112}
          height={112}
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto drop-shadow-md select-none pointer-events-none"
        />
      );
    }

    return (
      <Image
        src="/Overwhelmed Lemon’s Busy Day.webp"
        alt="Overwhelmed Mascot"
        width={112}
        height={112}
        className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto drop-shadow-md select-none pointer-events-none"
      />
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto py-2 sm:py-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Greeting Badge */}
      <div className="text-center mb-6">
        <div className="pill-badge mb-3">
          <Heart className="w-3.5 h-3.5 text-[var(--accent-rose)] fill-[var(--accent-rose)]" />
          <span>Challenge Completed</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
          How Well {result.nickname} Knows You
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] mt-1 truncate px-4">
          Quiz: {result.quizTitle}
        </p>
      </div>

      {/* Main Social Trophy Card */}
      <div className="card-cozy rounded-3xl p-6 sm:p-8 mb-6 text-center relative overflow-hidden">
        {/* Subtle decorative radial glow behind score */}
        <div
          aria-hidden="true"
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-[#F3D7A4]/25 via-[#D99A9A]/15 to-transparent rounded-full blur-3xl pointer-events-none"
        />

        {/* Brand Tag Pill */}
        <div className="flex flex-col items-center justify-center relative z-10 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--accent-plum)]/10 border border-[var(--accent-plum)]/20 mb-3">
            <BrandLogo size={16} showText={false} href={null} glow={false} />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-plum)]">
              LemonQuiz Match
            </span>
          </div>
        </div>

        {/* Dynamic Tier Mascot with Golden Starburst Glow Accent */}
        <div className="relative mx-auto mb-3 flex items-center justify-center">
          {/* Subtle starburst glow behind illustration */}
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 dark:opacity-25"
          >
            <Image
              src="/Golden Eight-Point Starburst Glow.webp"
              alt=""
              width={160}
              height={160}
              className="w-36 h-36 sm:w-44 sm:h-44 object-contain animate-pulse"
              priority
            />
          </div>
          <div className="relative z-10 drop-shadow-sm">
            {renderTierIllustration(result.percentage)}
          </div>
        </div>

        {/* Typographic Score Display */}
        <div className="flex flex-col items-center justify-center mb-4 relative z-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--text-muted)] mb-1">
            Friendship Score
          </span>
          <div className="text-5xl sm:text-6xl font-black text-[var(--text-primary)] tracking-tight flex items-baseline gap-1">
            <span>{result.score}</span>
            <span className="text-2xl sm:text-3xl font-bold text-[var(--accent-plum)]/60">
              /{result.total}
            </span>
          </div>

          {/* Match Percentage Pill with Starburst Glow */}
          <div className="mt-3.5 relative inline-block">
            <div
              aria-hidden="true"
              className="absolute -inset-1 bg-gradient-to-r from-[#D1A76A]/40 to-[#D99A9A]/40 rounded-full blur-xs -z-10"
            />
            <span className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full font-black text-sm tracking-wider bg-gradient-to-r from-[var(--accent-plum)] to-[var(--accent-rose)] text-white shadow-md">
              <Sparkles className="w-4 h-4 text-[#F3D7A4]" />
              {result.percentage}% MATCH
            </span>
          </div>
        </div>

        {/* Dynamic Friendship Verdict Box */}
        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] relative z-10">
          <div className="p-5 rounded-2xl bg-[var(--accent-plum)]/5 border border-[var(--accent-plum)]/15 text-left">
            <div className="flex items-center gap-3.5 mb-2.5">
              <div className="w-11 h-11 rounded-2xl bg-[var(--accent-plum)]/10 border border-[var(--accent-plum)]/20 flex items-center justify-center shadow-xs shrink-0">
                {renderVerdictIcon()}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--accent-plum)] block">
                  Friendship Verdict
                </span>
                <h3 className="text-base font-black text-[var(--text-primary)] leading-tight">
                  {verdict.title}
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed mt-1">
              {verdict.description}
            </p>
          </div>
        </div>
      </div>

      {/* CTAs Section: VIRAL CONVERSION PRIORITY */}
      <div className="space-y-3">
        {/* 1. PRIMARY CTA: Create Your Own Quiz */}
        <Link
          href="/create"
          className="btn-premium-gold w-full min-h-[56px] flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-[#8A5B17]" />
          <span>Create Your Own Quiz</span>
          <ArrowRight className="w-4 h-4 text-[#241C24]/80" />
        </Link>

        {/* 2. SECONDARY CTA: Share Result via WhatsApp */}
        <a
          href={getWhatsAppShareUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[56px] py-3.5 px-6 rounded-2xl bg-[#25D366] text-white hover:bg-[#20ba59] active:scale-[0.98] transition-all font-bold text-sm sm:text-base shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Score via WhatsApp</span>
        </a>

        {/* 3. TERTIARY ACTIONS: Copy Result Link & Retake Quiz */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn-secondary-cream min-h-[52px] text-xs sm:text-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[var(--accent-sage)]" />
                <span className="text-[var(--accent-sage)] font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Copy Result Link</span>
              </>
            )}
          </button>

          <Link
            href={`/q/${result.quizCode}`}
            className="btn-secondary-cream min-h-[52px] text-xs sm:text-sm flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-[var(--text-muted)]" />
            <span>Retake Quiz</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
