"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Crown,
  Clock,
  Share2,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import type { ILeaderboardEntry } from "@/types/quiz";
import { formatRelativeTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface RankingProps {
  leaderboard: ILeaderboardEntry[];
  quizCode: string;
  shareUrl: string;
}

export function Ranking({ leaderboard, quizCode, shareUrl }: RankingProps) {
  const [copied, setCopied] = useState(false);
  const effectiveShareUrl = shareUrl || `${process.env.NEXT_PUBLIC_APP_URL || ""}/q/${quizCode}`;

  const handleCopy = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(effectiveShareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy share link:", err);
    }
  };

  const getWhatsAppShareUrl = () => {
    const text = `Hey! Check out my friendship quiz! Take the test and see if you can top the leaderboard: ${effectiveShareUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const renderRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#E6C88A]/20 border border-[#E6C88A]/50 flex items-center justify-center shadow-xs shrink-0 relative overflow-hidden p-0.5">
            <Image
              src="/badge-podium-crown-gold.svg"
              alt="1st Place Gold Champion Podium"
              width={40}
              height={40}
              className="w-full h-full object-contain drop-shadow-xs"
              priority
            />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] flex items-center justify-center shadow-xs shrink-0 relative overflow-hidden p-0.5">
            <Image
              src="/badge-podium-medal-silver.svg"
              alt="2nd Place Silver Podium"
              width={40}
              height={40}
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[var(--accent-rose)]/15 border border-[var(--accent-rose)]/40 flex items-center justify-center shadow-xs shrink-0 relative overflow-hidden p-0.5">
            <Image
              src="/badge-podium-award-bronze.svg"
              alt="3rd Place Bronze Podium"
              width={40}
              height={40}
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-black text-sm flex items-center justify-center shrink-0">
            #{rank}
          </div>
        );
    }
  };

  const getPercentagePillClass = (pct: number) => {
    if (pct >= 90) return "bg-[var(--accent-sage)]/15 border-[var(--accent-sage)]/40 text-[var(--accent-sage)]";
    if (pct >= 70) return "bg-[var(--accent-rose)]/15 border-[var(--accent-rose)]/40 text-[var(--accent-rose)]";
    if (pct >= 40) return "bg-[var(--accent-lavender)]/20 border-[var(--accent-lavender)]/40 text-[var(--color-plum)]";
    return "bg-[var(--surface)] border-[var(--border-subtle)] text-[var(--text-muted)]";
  };

  return (
    <Card className="w-full rounded-3xl p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-plum)]/10 border border-[var(--color-plum)]/20 flex items-center justify-center text-[var(--color-plum)] shadow-xs">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-plum)] block">
              Leaderboard
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight">
              Friend Rankings
            </h3>
          </div>
        </div>

        <span className="text-xs font-bold text-[var(--color-plum)] px-3 py-1 rounded-full bg-[var(--color-plum)]/10 border border-[var(--color-plum)]/20">
          {leaderboard.length} {leaderboard.length === 1 ? "friend" : "friends"}
        </span>
      </div>

      {/* Empty State */}
      {leaderboard.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-2xl bg-[var(--color-plum)]/5 border border-[var(--color-plum)]/15 space-y-4">
          <div className="w-28 h-24 mx-auto flex items-center justify-center">
            <Image
              src="/empty-quizzes-cozy.svg"
              alt="No friend responses yet"
              width={140}
              height={110}
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="text-base font-bold text-[var(--text-primary)]">
              No friend responses yet!
            </h4>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              Drop your quiz link into group chats or stories to see who tops your podium.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 max-w-md mx-auto w-full">
            <a
              href={getWhatsAppShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex-1 min-h-[56px] py-4 px-5 rounded-2xl bg-[#25D366] text-white hover:bg-[#20ba59] active:scale-[0.98] transition-all font-bold text-sm shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2 cursor-pointer max-w-full"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Share on WhatsApp</span>
            </a>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto flex-1 min-h-[56px] max-w-full"
              onClick={handleCopy}
              leftIcon={
                copied ? (
                  <Check className="w-4 h-4 text-[var(--accent-sage)]" />
                ) : (
                  <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                )
              }
            >
              {copied ? "Link Copied" : "Copy Link"}
            </Button>
          </div>
        </div>
      ) : (
        /* Rankings List */
        <div className="space-y-2.5">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            const podiumHighlight =
              rank === 1
                ? "border-[#E6C88A]/60 bg-gradient-to-r from-[#FFFDF8] to-[var(--surface)] dark:from-[#2F2420] dark:to-[var(--surface)] shadow-xs ring-1 ring-[#E6C88A]/30"
                : rank === 2
                ? "border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs"
                : rank === 3
                ? "border-[var(--accent-rose)]/30 bg-[var(--surface)] shadow-xs"
                : "border-[var(--border-subtle)] bg-[var(--surface)]";

            return (
              <div
                key={entry.code || `${entry.nickname}-${index}`}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all shadow-xs gap-3 min-h-[56px] hover:border-[var(--color-plum)]/30 ${podiumHighlight}`}
              >
                {/* Left: Rank Badge + Nickname + Relative Time */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {renderRankBadge(rank)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-[var(--text-primary)] text-sm sm:text-base truncate block max-w-full">
                        {entry.nickname}
                      </span>
                      {rank === 1 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#8A5B17] dark:text-[#E6C88A] bg-[#E6C88A]/30 px-2 py-0.5 rounded-full border border-[#E6C88A]/50 shrink-0">
                          <Sparkles className="w-3 h-3 text-[#8A5B17] dark:text-[#E6C88A]" />
                          Top Friend
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs font-medium mt-0.5">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{formatRelativeTime(entry.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Score + Percentage Pill */}
                <div className="flex items-center gap-2.5 shrink-0 ml-2">
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                      {entry.score}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-muted)]">
                      /{entry.total}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-black border ${getPercentagePillClass(
                      entry.percentage,
                    )}`}
                  >
                    {entry.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
