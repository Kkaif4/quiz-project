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
    const text = `*Think you actually know me?*

    I just made a friendship quiz about me — let’s see how well you *Really Know Me*

    _Take the quiz_
    _Get your score_
    _See where you rank on my leaderboard_

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
    <div className="w-full card-surface rounded-3xl p-5 sm:p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-xs">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-400 block">
              Viral Share Hub
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight">
              Share Your Quiz Link
            </h3>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Active &amp; Ready</span>
        </div>
      </div>

      {/* Public URL Box */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Public Quiz Link (Send to Friends)
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 min-h-[56px] px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] flex items-center font-mono text-xs sm:text-sm text-[var(--text-primary)] truncate select-all">
            <span className="truncate">{publicUrl}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="min-h-[56px] py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:brightness-110 active:scale-[0.98] transition-all font-bold text-sm shadow-md shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer shrink-0 glow-purple"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white/90" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons: WhatsApp & QR Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Direct WhatsApp Share */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[56px] py-4 px-5 rounded-2xl bg-[#25D366] text-white hover:bg-[#20ba59] active:scale-[0.98] transition-all font-bold text-sm sm:text-base shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
          <span>Share on WhatsApp</span>
        </a>

        {/* Collapsible QR Preview Button */}
        <button
          type="button"
          onClick={() => setShowQr(!showQr)}
          className="min-h-[56px] py-4 px-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-violet-500/50 hover:bg-violet-500/10 active:scale-[0.98] transition-all font-bold text-sm sm:text-base text-[var(--text-primary)] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <QrCode className="w-5 h-5 text-violet-400" />
          <span>{showQr ? "Hide QR Code" : "Show QR Code"}</span>
          {showQr ? (
            <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </button>
      </div>

      {/* QR Code Container (Collapsible) */}
      {showQr && qrData && (
        <div className="p-6 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-md">
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
          <p className="text-xs font-semibold text-[var(--text-secondary)] mt-3 text-center">
            Scan with any phone camera to instantly open this friendship quiz.
          </p>
        </div>
      )}

      {/* Private Dashboard Link Pill (Only shown if ownerToken is provided) */}
      {ownerToken && (
        <div className="pt-2">
          <div className="p-4 rounded-2xl bg-violet-950/40 border border-violet-500/30 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0 mt-0.5">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                  Private Owner Dashboard Link
                </h4>
                <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  This page contains host controls and reveals detailed answers
                  submitted by each friend.
                  <strong className="text-violet-200 font-bold ml-1">
                    Bookmark this secret link!
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <div className="flex-1 min-h-[48px] px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] flex items-center font-mono text-[11px] sm:text-xs text-violet-300 truncate select-all">
                <span className="truncate">{dashboardUrl}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyDashboard}
                className="min-h-[48px] py-2.5 px-5 rounded-xl bg-violet-600 text-white hover:bg-violet-500 active:scale-[0.98] transition-all font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {copiedDashboard ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Secret Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-violet-200" />
                    <span>Copy Secret Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
