"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import type { IAttemptResultDetails } from "@/types/quiz";
import { getFriendshipVerdict } from "@/lib/utils";

interface QuizResultProps {
  result: IAttemptResultDetails;
}

export function QuizResult({ result }: QuizResultProps) {
  const [copied, setCopied] = useState(false);

  const verdict = getFriendshipVerdict(result.percentage);

  // Trigger celebratory confetti burst with violet, purple, lavender, pink, and indigo colors
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#8B5CF6", "#A855F7", "#C084FC", "#6366F1", "#F472B6"],
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
        return <Crown className="w-6 h-6 text-purple-400" />;
      case "HeartHandshake":
        return <HeartHandshake className="w-6 h-6 text-pink-400" />;
      case "Flame":
        return <Flame className="w-6 h-6 text-indigo-400" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6 text-violet-400" />;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-2 sm:py-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Greeting Badge */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Challenge Completed</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
          How Well {result.nickname} Knows You
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] mt-1 truncate px-4">
          Quiz: {result.quizTitle}
        </p>
      </div>

      {/* Main Social Trophy Card (Screenshot & Story-Ready) */}
      <div className="card-surface rounded-3xl p-6 sm:p-8 mb-6 text-center shadow-[0_12px_45px_rgb(0,0,0,0.25)] relative overflow-hidden border border-[var(--card-border)] glow-purple">
        {/* Subtle decorative radial glow behind score */}
        <div
          aria-hidden="true"
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"
        />

        {/* Typographic Score Display */}
        <div className="flex flex-col items-center justify-center mb-4 relative z-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--text-muted)] mb-1">
            Friendship Score
          </span>
          <div className="text-5xl sm:text-6xl font-black text-[var(--text-primary)] tracking-tight flex items-baseline gap-1">
            <span>{result.score}</span>
            <span className="text-2xl sm:text-3xl font-bold text-violet-400/60">
              /{result.total}
            </span>
          </div>
          <div className="mt-3.5">
            <span className="inline-flex items-center px-5 py-2 rounded-full font-black text-sm tracking-wider bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 glow-purple">
              {result.percentage}% MATCH
            </span>
          </div>
        </div>

        {/* Dynamic Friendship Verdict Box */}
        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] relative z-10">
          <div className="p-5 rounded-2xl bg-violet-500/10 border border-violet-500/25 text-left">
            <div className="flex items-center gap-3.5 mb-2.5">
              <div className="w-11 h-11 rounded-2xl bg-violet-500/20 border border-violet-500/35 flex items-center justify-center shadow-xs shrink-0">
                {renderVerdictIcon()}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-400 block">
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

      {/* CTAs Section: STRICT RULE 4.3 VIRAL CONVERSION PRIORITY */}
      <div className="space-y-3">
        {/* 1. PRIMARY RADIANT CTA: Create Your Own Quiz (Rule 4.3 Invariant) */}
        <Link
          href="/create"
          className="w-full min-h-[56px] py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white hover:brightness-110 active:scale-[0.98] transition-all font-black text-base shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2.5 cursor-pointer glow-purple-lg"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>Create Your Own Quiz</span>
          <ArrowRight className="w-4 h-4 text-white/80" />
        </Link>

        {/* 2. SECONDARY CTA: Share Result via WhatsApp */}
        <a
          href={getWhatsAppShareUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-[#25D366] text-white hover:bg-[#20ba59] active:scale-[0.98] transition-all font-bold text-sm sm:text-base shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Score via WhatsApp</span>
        </a>

        {/* 3. TERTIARY ACTIONS: Copy Result Link & Retake Quiz */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleCopyLink}
            className="min-h-[48px] py-3 px-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-violet-500/50 hover:bg-violet-500/10 active:scale-[0.98] transition-all font-semibold text-xs sm:text-sm text-[var(--text-secondary)] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Link Copied!</span>
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
            className="min-h-[48px] py-3 px-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-violet-500/50 hover:bg-violet-500/10 active:scale-[0.98] transition-all font-semibold text-xs sm:text-sm text-[var(--text-secondary)] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-[var(--text-muted)]" />
            <span>Retake Quiz</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
