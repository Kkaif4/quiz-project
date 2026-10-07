"use client";

import React, { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Check, X, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    tag: "COMFORT FOODS 🍕",
    text: "What is my absolute go-to comfort food late at night?",
    correctIdx: 0,
    options: [
      { text: "Extra spicy instant ramen with cheese 🍜", isCorrect: true },
      { text: "Cheesy garlic bread with ranch 🧄", isCorrect: false },
      { text: "Pepperoni pizza & garlic dip 🍕", isCorrect: false },
      { text: "Cold brew & chocolate cookies 🍪", isCorrect: false },
    ],
    roast: "😭 Bro guessed cold brew? Do you even know me?",
    praise: "🥰 Real one! Extra spicy ramen is elite at 2 AM.",
  },
  {
    id: 2,
    tag: "RED FLAGS & QUIRKS 🚩",
    text: "What is my biggest red flag according to my squad?",
    correctIdx: 1,
    options: [
      { text: "Replying 6 hours later with 'my bad was sleeping' 😴", isCorrect: false },
      { text: "Leaving people on delivered while posting on IG Story 📱", isCorrect: true },
      { text: "Singing word-for-word in the passenger seat 🎤", isCorrect: false },
      { text: "Ordering food and stealing your fries anyway 🍟", isCorrect: false },
    ],
    roast: "😂 Caught in 4K! The IG story ghosting is too real.",
    praise: "💫 Telepathic! You called out the delivered status instantly.",
  },
  {
    id: 3,
    tag: "3 AM VIBES 🎧",
    text: "What music genre do I blast when nobody is watching?",
    correctIdx: 2,
    options: [
      { text: "Sad Boy Indie / Bedroom Pop 🌧️", isCorrect: false },
      { text: "Aggressive Gym Phonk & Hardstyle ⚡", isCorrect: false },
      { text: "2010s Disney & Pop Throwbacks at full volume 🌟", isCorrect: true },
      { text: "Obscure Underground Hip-Hop 📻", isCorrect: false },
    ],
    roast: "😭 Wrong! You don't know my karaoke soul.",
    praise: "💖 Certified Soulmate! High School Musical on repeat.",
  },
];

export function InteractiveHeroTeaser() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const currentQ = SAMPLE_QUESTIONS[currentIdx];

  const handleSelect = (optIdx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(optIdx);

    if (optIdx === currentQ.correctIdx) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#FFB830", "#FF6B8A", "#B47AFF", "#36D399"],
          disableForReducedMotion: true,
        });
      } catch (err) {
        console.warn("Confetti error:", err);
      }
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setCurrentIdx((prev) => (prev + 1) % SAMPLE_QUESTIONS.length);
  };

  return (
    <div className="w-full card-surface rounded-3xl p-5 sm:p-7 space-y-5 border-2 border-[#FFB830]/40 shadow-[6px_6px_0px_#FFD4B3] relative overflow-hidden bg-gradient-to-b from-white to-[#FFF9F0]">
      {/* Top Banner with Question Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="lemon" tilt="left">
            <span>{currentQ.tag}</span>
          </Badge>
          <span className="text-[11px] font-black uppercase text-[#E67700] bg-[#FFB830]/15 px-2.5 py-0.5 rounded-full border border-[#FFB830]/30 hidden sm:inline-block">
            INTERACTIVE PREVIEW ✨
          </span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="text-xs font-black text-[var(--text-muted)] hover:text-[#FF8C42] transition-colors flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-xl hover:bg-[#FFB830]/10 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Another ({currentIdx + 1}/{SAMPLE_QUESTIONS.length})</span>
        </button>
      </div>

      {/* Question Headline */}
      <p className="text-lg sm:text-2xl font-black text-[var(--text-primary)] leading-snug">
        {currentQ.text}
      </p>

      {/* 4 Chunky Interactive Option Buttons */}
      <div className="space-y-2.5">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOpt === idx;
          const isAnswered = selectedOpt !== null;
          const isCorrect = opt.isCorrect;

          let btnStyles =
            "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-2 border-[var(--card-border)] shadow-[3px_3px_0px_#FFD4B3] hover:border-[#FFB830] hover:bg-[#FFB830]/5 active:translate-y-[2px] active:shadow-none";

          if (isAnswered) {
            if (isCorrect) {
              btnStyles =
                "bg-[#36D399] text-white border-2 border-[#1EAA78] shadow-[3px_3px_0px_#1EAA78] -translate-y-0.5";
            } else if (isSelected && !isCorrect) {
              btnStyles =
                "bg-[#FF6B8A] text-white border-2 border-[#E0456B] shadow-[3px_3px_0px_#E0456B]";
            } else {
              btnStyles = "bg-[var(--bg-secondary)]/50 text-[var(--text-primary)]/40 border-2 border-[var(--card-border)]/50 opacity-60";
            }
          }

          const letter = ["A", "B", "C", "D"][idx];

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              className={cn(
                "w-full min-h-[56px] text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between font-bold text-sm sm:text-base cursor-pointer select-none",
                btnStyles
              )}
            >
              <div className="flex items-center gap-3 pr-2">
                <span
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors",
                    isAnswered && isCorrect
                      ? "bg-white text-[#1EAA78]"
                      : isSelected && !isCorrect
                      ? "bg-white text-[#E0456B]"
                      : "bg-[#FFB830]/20 text-[#E67700] border border-[#FFB830]/30"
                  )}
                >
                  {letter}
                </span>
                <span className="leading-snug">{opt.text}</span>
              </div>

              {isAnswered && (
                <div className="shrink-0 pl-2">
                  {isCorrect ? (
                    <div className="w-6 h-6 rounded-full bg-white text-[#36D399] flex items-center justify-center shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-white text-[#FF6B8A] flex items-center justify-center shadow-xs">
                      <X className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Reaction Box */}
      {selectedOpt !== null && (
        <div
          className={cn(
            "p-4 rounded-2xl border-2 flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-150",
            selectedOpt === currentQ.correctIdx
              ? "bg-[#36D399]/15 border-[#36D399]/40 text-[#1EAA78]"
              : "bg-[#FF6B8A]/15 border-[#FF6B8A]/40 text-[#E0456B]"
          )}
        >
          <p className="text-xs sm:text-sm font-black">
            {selectedOpt === currentQ.correctIdx ? currentQ.praise : currentQ.roast}
          </p>

          <Link href="/create">
            <Button variant="lemon" size="sm" className="shrink-0">
              <span>Make Yours ✨</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#2D1B0E]" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
