"use client";

import React, { useState } from "react";
import {
  Crown,
  Medal,
  Award,
  Clock,
  Users,
  Share2,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import type { ILeaderboardEntry } from "@/types/quiz";
import { formatRelativeTime } from "@/lib/utils";

export interface RankingProps {
  leaderboard: ILeaderboardEntry[];
  quizCode: string;
  shareUrl: string;
}

export function Ranking({ leaderboard, quizCode, shareUrl }: RankingProps) {
  const [copied, setCopied] = useState(false);
  const effectiveShareUrl = shareUrl || `/q/${quizCode}`;

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
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-400 flex items-center justify-center shadow-xs shrink-0 glow-purple">
            <Crown className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 rounded-2xl bg-slate-400/15 border border-slate-400/35 text-slate-300 flex items-center justify-center shadow-xs shrink-0">
            <Medal className="w-5 h-5 fill-slate-300 text-slate-300" />
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/35 text-orange-300 flex items-center justify-center shadow-xs shrink-0">
            <Award className="w-5 h-5 fill-orange-400 text-orange-300" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-300 font-black text-sm flex items-center justify-center shrink-0">
            #{rank}
          </div>
        );
    }
  };

  const getPercentagePillClass = (pct: number) => {
    if (pct >= 90) return "bg-purple-500/15 border-purple-500/35 text-purple-300";
    if (pct >= 70) return "bg-pink-500/15 border-pink-500/35 text-pink-300";
    if (pct >= 40) return "bg-indigo-500/15 border-indigo-500/35 text-indigo-300";
    return "bg-violet-950/40 border-violet-800/40 text-violet-300";
  };

  return (
    <div className="w-full card-surface rounded-3xl p-5 sm:p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-xs">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-400 block">
              Leaderboard
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight">
              Friend Rankings
            </h3>
          </div>
        </div>

        <span className="text-xs font-bold text-violet-300 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/25">
          {leaderboard.length} {leaderboard.length === 1 ? "friend" : "friends"}
        </span>
      </div>

      {/* Empty State */}
      {leaderboard.length === 0 ? (
        <div className="py-10 px-4 text-center rounded-2xl bg-violet-500/10 border border-violet-500/20 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 mx-auto flex items-center justify-center text-violet-400 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="text-base font-bold text-[var(--text-primary)]">
              No friend responses yet!
            </h4>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              Drop your quiz link into group chats or Instagram stories to see who tops your podium.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 max-w-md mx-auto">
            <a
              href={getWhatsAppShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-h-[56px] py-4 px-6 rounded-2xl bg-[#25D366] text-white hover:bg-[#20ba59] active:scale-[0.98] transition-all font-bold text-sm shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full sm:w-auto min-h-[56px] py-4 px-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-violet-500/50 hover:bg-violet-500/10 active:scale-[0.98] transition-all font-semibold text-sm text-[var(--text-primary)] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Rankings List */
        <div className="space-y-2.5">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            return (
              <div
                key={entry.code || `${entry.nickname}-${index}`}
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-violet-500/40 transition-all shadow-xs gap-3"
              >
                {/* Left: Rank Badge + Nickname + Relative Time */}
                <div className="flex items-center gap-3 min-w-0">
                  {renderRankBadge(rank)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[var(--text-primary)] text-sm sm:text-base truncate block">
                        {entry.nickname}
                      </span>
                      {rank === 1 && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/35">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Top Friend
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs font-medium mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(entry.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Score + Percentage Pill */}
                <div className="flex items-center gap-2.5 shrink-0">
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
    </div>
  );
}
