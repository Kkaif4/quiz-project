"use client";

import React, { useState } from "react";
import { ToggleLeft, ToggleRight, Loader2, AlertCircle } from "lucide-react";
import type { QuizStatus } from "@/types/quiz";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
      setStatus(previousStatus);
      const message =
        err instanceof Error ? err.message : "Unable to reach server. Changes rolled back.";
      setErrorMessage(message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full card-surface rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Presentation */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
              isLive
                ? "bg-[#10B981]/15 border-[#10B981]/35 text-2xl"
                : "bg-amber-500/15 border-amber-500/35 text-2xl"
            }`}
          >
            {isLive ? "🟢" : "⏸️"}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight">
                {isLive ? "Quiz is Active" : "Submissions Paused"}
              </h3>
              <Badge variant={isLive ? "mint" : "slate"}>
                {isLive ? "Accepting Attempts" : "Paused"}
              </Badge>
            </div>
            <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">
              {isLive
                ? "Anyone with your link can take the quiz and rank."
                : "New attempts are locked. Old responses are preserved."}
            </p>
          </div>
        </div>

        {/* Toggle Button */}
        <Button
          type="button"
          variant={isLive ? "ghost" : "lemon"}
          size="md"
          onClick={handleToggleStatus}
          disabled={isUpdating}
          className="shrink-0"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </>
          ) : isLive ? (
            <>
              <ToggleRight className="w-5 h-5 text-emerald-400" />
              <span>Pause Quiz</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-[#2D1B0E]" />
              <span>Resume Quiz ⚡</span>
            </>
          )}
        </Button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border-2 border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
