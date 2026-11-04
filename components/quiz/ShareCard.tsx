"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
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
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
    getServerOriginSnapshot
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
    const text = `*Think you actually know me?* 👑

I just made a friendship quiz about me — let’s see how well you *Really Know Me* ⚡

_Take the quiz_
_Get your score_
_See where you rank on my squad leaderboard_

Think you can beat everyone?

${publicUrl}`;

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [publicUrl]);

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
    <div className="w-full card-surface rounded-3xl p-5 sm:p-6 space-y-5">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFB830]/15 border-2 border-[#FFB830]/30 flex items-center justify-center text-xl shrink-0">
            🚀
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#E67700] block">
              Viral Share Hub
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight">
              Share Your Quiz Link
            </h3>
          </div>
        </div>

        <Badge variant="lemon" tilt="right">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ready to share</span>
        </Badge>
      </div>

      {/* Public URL Box */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
          Public Quiz Link (Send to Friends / Story)
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 min-h-[56px] px-4 py-3 rounded-2xl bg-[var(--input-bg)] border-2 border-[var(--input-border)] flex items-center font-mono text-xs sm:text-sm text-[var(--text-primary)] truncate select-all">
            <span className="truncate">{publicUrl}</span>
          </div>
          <Button
            type="button"
            variant="lemon"
            size="md"
            onClick={handleCopyLink}
            className="shrink-0"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-[#2D1B0E]" />
                <span>Copied! ✨</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#2D1B0E]" />
                <span>Copy Link</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Action Buttons: WhatsApp & QR Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Direct WhatsApp Share */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            className="bg-[#25D366]/15 border-[#25D366]/50 text-white hover:bg-[#25D366]/25"
          >
            <Share2 className="w-5 h-5 text-[#25D366]" />
            <span>Share on WhatsApp 💬</span>
          </Button>
        </a>

        {/* Collapsible QR Preview Button */}
        <Button
          type="button"
          variant="ghost"
          size="lg"
          fullWidth
          onClick={() => setShowQr(!showQr)}
        >
          <QrCode className="w-5 h-5 text-[#B47AFF]" />
          <span>{showQr ? "Hide QR Code" : "Show QR Code"}</span>
          {showQr ? (
            <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </Button>
      </div>

      {/* QR Code Container */}
      {showQr && qrData && (
        <div className="p-6 rounded-2xl bg-[var(--card-bg)] border-2 border-[var(--card-border)] flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md">
            <svg
              viewBox={`0 0 ${qrData.totalSize} ${qrData.totalSize}`}
              className="w-48 h-48 text-slate-900"
              fill="currentColor"
              shapeRendering="crispEdges"
            >
              <rect width="100%" height="100%" fill="white" />
              <path d={qrData.path} fill="currentColor" />
            </svg>
          </div>
          <p className="text-xs font-bold text-[var(--text-secondary)] mt-3 text-center">
            Scan with any phone camera to instantly start the test 📸
          </p>
        </div>
      )}

      {/* Private Dashboard Link Pill */}
      {ownerToken && (
        <div className="pt-2">
          <div className="p-4 rounded-2xl bg-[#FFB830]/10 border-2 border-[#FFB830]/25 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFB830]/20 border border-[#FFB830]/40 flex items-center justify-center text-xl shrink-0 mt-0.5">
                👑
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#E67700]">
                  Private Owner Dashboard Link
                </h4>
                <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Contains host controls and reveals exact answers from every friend.
                  <strong className="text-[#E67700] font-bold ml-1">
                    Bookmark this secret link!
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <div className="flex-1 min-h-[48px] px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border-2 border-[var(--input-border)] flex items-center font-mono text-[11px] sm:text-xs text-[#E67700] truncate select-all">
                <span className="truncate">{dashboardUrl}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyDashboard}
                className="shrink-0"
              >
                {copiedDashboard ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                    <span>Copy Secret Link</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
