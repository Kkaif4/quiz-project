"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  Flame,
  Crown,
  HeartHandshake,
} from "lucide-react";
import type { IAttemptResultDetails } from "@/types/quiz";
import { getFriendshipVerdict } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface QuizResultProps {
  result: IAttemptResultDetails;
}

export function QuizResult({ result }: QuizResultProps) {
  const [copied, setCopied] = useState(false);

  const verdict = getFriendshipVerdict(result.percentage);

  // Trigger celebratory confetti burst with Electric Lemon, Hot Coral, and Neon Violet
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FFB830", "#FF6B8A", "#B47AFF", "#36D399", "#7C8FFF"],
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
    const message = `I scored ${result.score}/${result.total} (${result.percentage}%) on "${result.quizTitle}"! 👑 Can you beat my score? Take the quiz here: ${playUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const renderVerdictEmoji = () => {
    if (result.percentage >= 90) return "💫";
    if (result.percentage >= 70) return "👑";
    if (result.percentage >= 45) return "🤝";
    if (result.percentage >= 20) return "🫖";
    return "😭";
  };

  return (
    <div className="w-full max-w-xl mx-auto py-2 sm:py-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Greeting Badge */}
      <div className="text-center mb-6 space-y-2">
        <div className="flex justify-center">
          <Badge variant="lemon" tilt="right">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB830]" />
            <span>Challenge Completed</span>
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
          How Well {result.nickname} Knows You
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] truncate px-4">
          Quiz: {result.quizTitle}
        </p>
      </div>

      {/* Main Social Trophy Card (Screenshot & Story-Ready) */}
      <div className="card-surface rounded-3xl p-6 sm:p-8 mb-6 text-center relative overflow-hidden border-2 border-[var(--card-border)]">
        {/* Glow ambient */}
        <div
          aria-hidden="true"
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#FFB830]/15 rounded-full blur-3xl pointer-events-none"
        />

        {/* Typographic Score Display */}
        <div className="flex flex-col items-center justify-center mb-4 relative z-10">
          <span className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
            Friendship Score
          </span>
          <div className="text-6xl sm:text-7xl font-black text-[var(--text-primary)] tracking-tight flex items-baseline gap-1">
            <span>{result.score}</span>
            <span className="text-2xl sm:text-3xl font-bold text-[var(--text-muted)]">
              /{result.total}
            </span>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full font-black text-sm tracking-wider bg-[#FFB830] text-[#2D1B0E] shadow-[0_3px_0_#E09800]">
              <span>{renderVerdictEmoji()}</span>
              <span>{result.percentage}% SQUAD MATCH</span>
            </span>
          </div>
        </div>

        {/* Dynamic Friendship Verdict Box */}
        <div className="mt-6 pt-6 border-t-2 border-[var(--border-subtle)] relative z-10">
          <div className="p-5 rounded-2xl bg-[var(--card-bg)] border-2 border-[var(--card-border)] text-left shadow-xs">
            <div className="flex items-center gap-3.5 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-[#FFB830]/15 border border-[#FFB830]/30 flex items-center justify-center text-2xl shrink-0">
                {renderVerdictEmoji()}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#E67700] block">
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
        {/* 1. PRIMARY RADIANT CTA: Create Your Own Quiz */}
        <Link href="/create" className="block">
          <Button variant="lemon" size="lg" fullWidth>
            <Sparkles className="w-5 h-5 text-[#2D1B0E]" />
            <span>Create Your Own Quiz in 60s ✨</span>
            <ArrowRight className="w-5 h-5 text-[#2D1B0E]" />
          </Button>
        </Link>



        {/* 3. TERTIARY ACTIONS: Copy Result Link */}
        <div className="grid grid-cols-1 gap-3 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Copy Result</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
