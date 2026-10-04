"use client";

import React, { useState } from "react";
import { ToggleLeft, ToggleRight, Loader2, AlertCircle } from "lucide-react";
import type { QuizStatus } from "@/types/quiz";

export interface QuizControlsProps {
  quizCode: string;
  ownerToken: string;
  initialStatus: QuizStatus;
}

export function QuizControls({
  quizCode,
  ownerToken,
  initialStatus,
}: QuizControlsProps) {
  const [status, setStatus] = useState<QuizStatus>(initialStatus);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLive = status === "active";

  const handleToggleStatus = async () => {
    if (isUpdating) return;

    const previousStatus = status;
    const nextStatus: QuizStatus = isLive ? "disabled" : "active";

    // Optimistic UI update
    setStatus(nextStatus);
    setErrorMessage(null);
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/quizzes/${encodeURIComponent(quizCode)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ownerToken,
          status: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update quiz status");
      }
    } catch (err: unknown) {
      console.error("Status update error:", err);
      // Rollback on error
      setStatus(previousStatus);
      const message =
        err instanceof Error ? err.message : "Unable to reach server. Changes rolled back.";
      setErrorMessage(message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full card-surface rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Presentation */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isLive
                ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-400"
                : "bg-amber-500/15 border-amber-500/35 text-amber-400"
            }`}
          >
            {isLive ? (
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400"></span>
              </span>
            ) : (
              <span className="inline-flex rounded-full h-3.5 w-3.5 bg-amber-400"></span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight">
                {isLive ? "Quiz is Live" : "Submissions Paused"}
              </h3>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isLive
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                }`}
              >
                {isLive ? "Accepting Attempts" : "Paused"}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] mt-0.5">
              {isLive
                ? "Friends can open your link, take the quiz, and submit responses."
                : "Your quiz is temporarily closed. New submissions are blocked."}
            </p>
          </div>
        </div>

        {/* 56px Touch Target Toggle Button */}
        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={isUpdating}
          className={`min-h-[56px] py-4 px-6 rounded-2xl border active:scale-[0.98] transition-all font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${
            isLive
              ? "border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] hover:border-violet-500/50 hover:bg-violet-500/10"
              : "bg-gradient-to-r from-violet-600 to-indigo-600 border-transparent text-white hover:brightness-110 shadow-md shadow-violet-600/30 glow-purple"
          }`}
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
              <span>Updating...</span>
            </>
          ) : isLive ? (
            <>
              <ToggleRight className="w-6 h-6 text-emerald-400" />
              <span>Pause Submissions</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-6 h-6 text-white/80" />
              <span>Resume Submissions</span>
            </>
          )}
        </button>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs font-semibold animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
