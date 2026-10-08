"use client";

import React, { useState } from "react";
import {
  Crown,
  Clock,
  Users,
  Share2,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import type { ILeaderboardEntry } from "@/types/quiz";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toJpeg } from "html-to-image";

export interface RankingProps {
  leaderboard: ILeaderboardEntry[];
  quizCode: string;
  shareUrl: string;
}

export function Ranking({ leaderboard, quizCode, shareUrl }: RankingProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const rankingRef = React.useRef<HTMLDivElement>(null);
  const effectiveShareUrl =
    shareUrl || `${process.env.NEXT_PUBLIC_APP_URL}/q/${quizCode}`;

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
    const text = `Hey squad! 👑 Check out my friendship test — see who can top my live leaderboard: ${effectiveShareUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const handleGenerateImage = async () => {
    if (!rankingRef.current) return;
    try {
      setIsGenerating(true);
      // Wait a moment for styles to apply if needed
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const dataUrl = await toJpeg(rankingRef.current, { 
        quality: 0.95,
        backgroundColor: '#1E1B4B', // or your theme's dark background color
        style: { margin: '0' }
      });
      
      // Attempt to use native share API if supported
      if (navigator.share) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], 'leaderboard.jpg', { type: 'image/jpeg' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'My Quiz Leaderboard',
              text: `Check out my quiz leaderboard! Create your own at ${process.env.NEXT_PUBLIC_APP_URL || 'lemonquiz.com'}`,
              files: [file],
            });
            return;
          }
        } catch (shareErr) {
          console.error("Error sharing via native API:", shareErr);
          // Fallback to download
        }
      }

      // Fallback: download the image
      const link = document.createElement('a');
      link.download = `quiz-leaderboard-${quizCode}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 rounded-2xl bg-[#FFB830] text-[#2D1B0E] font-black text-lg flex items-center justify-center shadow-[0_3px_0_#E09800] shrink-0">
            👑
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 rounded-2xl bg-slate-300 text-slate-900 font-black text-lg flex items-center justify-center shadow-[0_3px_0_#94A3B8] shrink-0">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white font-black text-lg flex items-center justify-center shadow-[0_3px_0_#92400E] shrink-0">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--card-border)] text-[var(--text-muted)] font-black text-sm flex items-center justify-center shrink-0">
            #{rank}
          </div>
        );
    }
  };

  const renderScorePill = (pct: number) => {
    if (pct >= 90) return <Badge variant="lemon">🔮 {pct}% Soulmate</Badge>;
    if (pct >= 70) return <Badge variant="mint">👑 {pct}% BFF</Badge>;
    if (pct >= 40) return <Badge variant="violet">🤝 {pct}% Homie</Badge>;
    return <Badge variant="slate">☕ {pct}%</Badge>;
  };

  return (
    <div className="w-full space-y-4">
      <div 
        ref={rankingRef} 
        className="w-full card-surface rounded-3xl p-5 sm:p-6 space-y-5 bg-[var(--bg-primary)] border border-[var(--border-subtle)]"
      >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFB830]/15 border-2 border-[#FFB830]/30 flex items-center justify-center text-xl shrink-0">
            🏆
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#E67700] block">
              Live Standings
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight">
              Squad Leaderboard
            </h3>
          </div>
        </div>

        <Badge variant="lemon" tilt="right">
          <span>
            {leaderboard.length} {leaderboard.length === 1 ? "friend" : "friends"}
          </span>
        </Badge>
      </div>

      {/* Empty State */}
      {leaderboard.length === 0 ? (
        <div className="py-10 px-4 text-center rounded-2xl bg-[var(--card-bg)] border-2 border-[var(--card-border)] space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#FFB830]/15 border-2 border-[#FFB830]/30 mx-auto flex items-center justify-center text-3xl animate-bounce">
            📢
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="text-base font-black text-[var(--text-primary)]">
              Your leaderboard is empty!
            </h4>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              Drop your quiz link into group chats or Instagram stories to see who takes the crown.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 max-w-md mx-auto">
            <a
              href={getWhatsAppShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="ghost"
                size="md"
                className="w-full bg-[#25D366]/15 border-[#25D366]/50 text-white hover:bg-[#25D366]/25"
              >
                <Share2 className="w-4 h-4 text-[#25D366]" />
                <span>Share to WhatsApp</span>
              </Button>
            </a>

            <Button
              type="button"
              variant="lemon"
              size="md"
              onClick={handleCopy}
              className="w-full sm:w-auto"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#2D1B0E]" />
                  <span>Link Copied! ✨</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#2D1B0E]" />
                  <span>Copy Quiz Link</span>
                </>
              )}
            </Button>
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
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2 border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[#FFB830]/40 transition-all shadow-[var(--shadow-tactile)] gap-3"
              >
                {/* Left: Rank Badge + Nickname + Relative Time */}
                <div className="flex items-center gap-3 min-w-0">
                  {renderRankBadge(rank)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[var(--text-primary)] text-sm sm:text-base truncate block">
                        {entry.nickname}
                      </span>
                      {rank === 1 && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#2D1B0E] bg-[#FFB830] px-2 py-0.5 rounded-full shadow-xs">
                          <Sparkles className="w-3 h-3 text-[#2D1B0E]" />
                          Squad MVP
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs font-semibold mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(entry.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Score + Percentage Pill */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                      {entry.score}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-muted)]">
                      /{entry.total}
                    </span>
                  </div>

                  {renderScorePill(entry.percentage)}
                </div>
              </div>
            );
          })}
              {/* Download / Share Image Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4" data-html2canvas-ignore="true">
                <Button
                  type="button"
                  variant="lemon"
                  size="md"
                  onClick={handleGenerateImage}
                  disabled={isGenerating}
                  className="w-full sm:w-auto font-black"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">Generating...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#2D1B0E]" />
                      <span>Share to Instagram / WhatsApp Status 📸</span>
                    </>
                  )}
                </Button>
              </div>

            </div>
          )}

          {/* Watermark/Footer for the exported image */}
          {leaderboard.length > 0 && (
            <div className="mt-6 pt-4 border-t-2 border-[var(--border-subtle)] text-center pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                Create your own quiz in 60s at lemonquiz.com
              </span>
            </div>
          )}
        </div>
      </div>
  );
}
