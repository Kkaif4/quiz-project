"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  Share2,
  Copy,
  Check,
  QrCode,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { generateQrMatrix, getQrPathData } from "@/lib/qr";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface ShareCardProps {
  quizCode: string;
  quizTitle: string;
  ownerToken?: string;
}

const emptySubscribe = () => () => {};
const getOriginSnapshot = () => window.location.origin;
const getServerOriginSnapshot = () => "";

export function ShareCard({ quizCode, quizTitle, ownerToken }: ShareCardProps) {
  const origin = useSyncExternalStore(
    emptySubscribe,
    getOriginSnapshot,
    getServerOriginSnapshot,
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDashboard, setCopiedDashboard] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const publicUrl = useMemo(() => {
    return origin ? `${origin}/q/${quizCode}` : `/q/${quizCode}`;
  }, [origin, quizCode]);

  const dashboardUrl = useMemo(() => {
    return ownerToken
      ? origin
        ? `${origin}/manage/${ownerToken}`
        : `/manage/${ownerToken}`
      : "";
  }, [origin, ownerToken]);

  const whatsappUrl = useMemo(() => {
    const titleText = quizTitle ? ` "${quizTitle}"` : "";
    const text = `*Think you actually know me?*

I just made a friendship quiz${titleText} — let’s see how well you *Really Know Me*

_Take the quiz_
_Get your score_
_See where you rank on my leaderboard_

Think you can beat everyone?

${publicUrl}`;

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [publicUrl, quizTitle]);

  const qrData = useMemo(() => {
    if (!publicUrl) return null;
    const matrix = generateQrMatrix(publicUrl);
    const margin = 2;
    const totalSize = matrix.length + margin * 2;
    const path = getQrPathData(matrix, margin);
    return { totalSize, path };
  }, [publicUrl]);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(publicUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleCopyDashboard = async () => {
    if (!dashboardUrl) return;
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(dashboardUrl);
        setCopiedDashboard(true);
        setTimeout(() => setCopiedDashboard(false), 2500);
      }
    } catch (err) {
      console.error("Failed to copy dashboard link:", err);
    }
  };

  return (
    <Card className="w-full rounded-3xl p-5 sm:p-6 space-y-5">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-plum)]/10 border border-[var(--color-plum)]/20 flex items-center justify-center text-[var(--color-plum)] shadow-xs">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-plum)] block">
              Viral Share Hub
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight">
              Share Your Quiz Link
            </h3>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-sage)]/15 border border-[var(--accent-sage)]/30 text-[var(--accent-sage)] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Active &amp; Ready</span>
        </div>
      </div>

      {/* Public URL Box (UI-010: full-width, no dead space) */}
      <div className="space-y-2 w-full">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Public Quiz Link (Send to Friends)
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
          <div className="flex-1 min-w-0 min-h-[56px] px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] flex items-center font-mono text-xs sm:text-sm text-[var(--text-primary)] truncate select-all">
            <span className="truncate w-full">{publicUrl}</span>
          </div>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleCopyLink}
            className="w-full sm:w-auto shrink-0 min-h-[56px] px-5"
            leftIcon={
              copiedLink ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Copy className="w-4 h-4 text-white/90" />
              )
            }
          >
            <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
          </Button>
        </div>
      </div>

      {/* Action Buttons: WhatsApp & QR Code (UI-009 overflow safety) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {/* Direct WhatsApp Share */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[56px] py-4 px-4 sm:px-5 rounded-2xl bg-[#25D366] text-white hover:bg-[#20ba59] active:scale-[0.98] transition-all font-bold text-sm sm:text-base shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2.5 cursor-pointer max-w-full"
        >
          <Share2 className="w-5 h-5 shrink-0" />
          <span className="truncate">Share on WhatsApp</span>
        </a>

        {/* Collapsible QR Preview Button */}
        <Button
          type="button"
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setShowQr(!showQr)}
          leftIcon={<QrCode className="w-5 h-5 text-[var(--color-plum)]" />}
          rightIcon={
            showQr ? (
              <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            )
          }
        >
          <span>{showQr ? "Hide QR Code" : "Show QR Code"}</span>
        </Button>
      </div>

      {/* QR Code Container (Collapsible) */}
      {showQr && qrData && (
        <div className="p-6 rounded-2xl bg-[var(--color-plum)]/5 border border-[var(--color-plum)]/15 flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-md">
            <svg
              viewBox={`0 0 ${qrData.totalSize} ${qrData.totalSize}`}
              className="w-48 h-48 text-stone-900"
              fill="currentColor"
              shapeRendering="crispEdges"
            >
              <rect width="100%" height="100%" fill="white" />
              <path d={qrData.path} fill="currentColor" />
            </svg>
          </div>
          <Image
            src="/story-card-watermark.svg"
            alt="LemonQuiz Branding"
            width={140}
            height={32}
            className="h-7 w-auto object-contain opacity-90"
          />
          <p className="text-xs font-semibold text-[var(--text-secondary)] text-center">
            Scan with any phone camera to instantly open this friendship quiz.
          </p>
        </div>
      )}

      {/* Private Dashboard Link Pill */}
      {ownerToken && (
        <div className="pt-2 w-full">
          <div className="p-4 rounded-2xl bg-[var(--color-plum)]/5 border border-[var(--color-plum)]/20 space-y-3 w-full">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-plum)]/15 border border-[var(--color-plum)]/25 flex items-center justify-center text-[var(--color-plum)] shrink-0 mt-0.5">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-plum)]">
                  Private Owner Dashboard Link
                </h4>
                <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  This page contains host controls and reveals detailed answers
                  submitted by each friend.
                  <strong className="text-[var(--text-primary)] font-bold ml-1">
                    Bookmark this secret link!
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 w-full">
              <div className="flex-1 min-w-0 min-h-[48px] px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] flex items-center font-mono text-[11px] sm:text-xs text-[var(--text-primary)] truncate select-all">
                <span className="truncate w-full">{dashboardUrl}</span>
              </div>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleCopyDashboard}
                className="w-full sm:w-auto shrink-0 min-h-[48px] px-4"
                leftIcon={
                  copiedDashboard ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/90" />
                  )
                }
              >
                <span>{copiedDashboard ? "Secret Link Copied!" : "Copy Secret Link"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
