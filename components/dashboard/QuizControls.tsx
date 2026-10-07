"use client";

import React, { useState } from "react";
import { ToggleLeft, ToggleRight, Loader2, AlertCircle } from "lucide-react";
import type { QuizStatus } from "@/types/quiz";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
    <Card className="w-full rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Presentation (UI-008 alignment fix) */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isLive
                ? "bg-[var(--accent-sage)]/15 border-[var(--accent-sage)]/35 text-[var(--accent-sage)]"
                : "bg-[var(--accent-champagne)]/25 border-[var(--accent-champagne)]/40 text-[#8A5B17]"
            }`}
          >
            {isLive ? (
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-sage)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[var(--accent-sage)]"></span>
              </span>
            ) : (
              <span className="inline-flex rounded-full h-3.5 w-3.5 bg-[#8A5B17]"></span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-0">
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight truncate">
                {isLive ? "Quiz is Live" : "Submissions Paused"}
              </h3>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${
                  isLive
                    ? "bg-[var(--accent-sage)]/15 border-[var(--accent-sage)]/30 text-[var(--accent-sage)]"
                    : "bg-[var(--accent-champagne)]/25 border-[var(--accent-champagne)]/40 text-[#8A5B17]"
                }`}
              >
                {isLive ? "Accepting Attempts" : "Paused"}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] mt-0.5 leading-relaxed">
              {isLive
                ? "Friends can open your link, take the quiz, and submit responses."
                : "Your quiz is temporarily closed. New submissions are blocked."}
            </p>
          </div>
        </div>

        {/* 56px Touch Target Toggle Button (UI-008 & UI-009 overflow fix) */}
        <Button
          type="button"
          onClick={handleToggleStatus}
          disabled={isUpdating}
          variant={isLive ? "secondary" : "primary"}
          size="lg"
          className="w-full sm:w-auto max-w-full shrink-0 min-h-[56px] px-4 sm:px-6"
          leftIcon={
            isUpdating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLive ? (
              <ToggleRight className="w-6 h-6 text-[var(--accent-sage)]" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-white/80" />
            )
          }
        >
          <span className="truncate">
            {isUpdating ? "Updating..." : isLive ? "Pause Submissions" : "Resume Submissions"}
          </span>
        </Button>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </Card>
  );
}
