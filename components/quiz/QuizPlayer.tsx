"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  User,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
} from "lucide-react";
import type { IQuizPublic } from "@/types/quiz";
import { cn } from "@/lib/utils";

interface QuizPlayerProps {
  quiz: IQuizPublic;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

const REPORT_REASONS = [
  { value: "spam", label: "Spam or Scam" },
  { value: "harassment", label: "Bullying or Harassment" },
  { value: "hate", label: "Hate Speech" },
  { value: "sexual", label: "Inappropriate / Sexual Content" },
  { value: "impersonation", label: "Impersonation" },
  { value: "other", label: "Other Violation" },
] as const;

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  const router = useRouter();

  // Stage: "nickname" | "playing" | "submitting" | "error"
  const [stage, setStage] = useState<"nickname" | "playing" | "submitting" | "error">(
    "nickname",
  );

  // Participant details
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  // Quiz progression state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: string; optionId: string }>>(
    [],
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const startTimeRef = React.useRef<number>(0);

  // Submission error handling
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Anti-bot honeypot
  const [honeypot, setHoneypot] = useState("");

  // Report Modal state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string>("spam");
  const [reportDescription, setReportDescription] = useState("");
  const [reportHoneypot, setReportHoneypot] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const totalQuestions = quiz.questions.length;
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercent =
    totalQuestions > 0
      ? Math.round(((currentQuestionIndex) / totalQuestions) * 100)
      : 0;

  // Handle Nickname validation and starting quiz
  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setNicknameError("Please enter your name or nickname to join the leaderboard.");
      return;
    }
    if (trimmed.length > 30) {
      setNicknameError("Nickname cannot exceed 30 characters.");
      return;
    }
    setNicknameError(null);
    startTimeRef.current = Date.now();
    setStage("playing");
  };

  // Submit attempt to server
  const handleSubmitQuiz = React.useCallback(
    async (finalAnswers: Array<{ questionId: string; optionId: string }>) => {
      setStage("submitting");
      setSubmitError(null);

      // Calculate actual elapsed time without artificial client-side clamping
      // Sub-3-second submissions will trigger server-side anti-bot validator
      const elapsedSeconds = Math.round(
        (Date.now() - startTimeRef.current) / 1000,
      );

      try {
        const response = await fetch(`/api/quizzes/${quiz.code}/attempts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nickname: nickname.trim(),
            answers: finalAnswers,
            durationSeconds: elapsedSeconds,
            website: honeypot, // Honeypot anti-bot
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          if (response.status === 403) {
            throw new Error(
              data.error ||
                "You have reached the maximum number of attempts allowed for this quiz.",
            );
          }
          if (response.status === 429) {
            throw new Error(
              data.error ||
                "Too many attempts from this connection. Please wait a few minutes.",
            );
          }
          throw new Error(data.error || "Failed to submit quiz attempt.");
        }

        const attemptResult = data.data;
        router.push(`/q/${quiz.code}/result/${attemptResult.attemptCode}`);
      } catch (err: unknown) {
        console.error("Submission failed:", err);
        const msg =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while scoring your quiz.";
        setSubmitError(msg);
        setStage("error");
      }
    },
    [honeypot, nickname, quiz.code, router],
  );

  // Handle Option selection with 250ms tactile feedback auto-advance
  const handleSelectOption = (optionId: string) => {
    if (selectedOptionId !== null || stage !== "playing") return;

    setSelectedOptionId(optionId);

    const updatedAnswers = [
      ...answers.filter((a) => a.questionId !== currentQuestion.id),
      { questionId: currentQuestion.id, optionId },
    ];
    setAnswers(updatedAnswers);

    // 250ms tactile feedback delay before sliding to next question or submitting
    setTimeout(() => {
      setSelectedOptionId(null);

      if (currentQuestionIndex + 1 < totalQuestions) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // All questions answered, trigger submission
        handleSubmitQuiz(updatedAnswers);
      }
    }, 250);
  };

  // Handle Report Submission
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    setReportError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quiz.code,
          reason: reportReason,
          description: reportDescription.trim(),
          website: reportHoneypot,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit report.");
      }

      setReportSuccess(true);
      setTimeout(() => {
        setIsReportOpen(false);
        setReportSuccess(false);
        setReportDescription("");
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting report.";
      setReportError(msg);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col min-h-[calc(100vh-140px)] justify-between">
      {/* Honeypot hidden input */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />

      <div className="w-full">
        {/* ===================================================================
            STAGE 1: NICKNAME ENTRY CARD
            =================================================================== */}
        {stage === "nickname" && (
          <div className="card-surface rounded-3xl p-6 sm:p-8 mt-4 animate-in fade-in zoom-in-95 duration-200 shadow-[0_12px_40px_rgb(0,0,0,0.2)]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Friendship Challenge</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
              {quiz.title}
            </h1>

            {quiz.description && (
              <p className="text-[var(--text-secondary)] text-sm sm:text-base font-medium mt-2 leading-relaxed">
                {quiz.description}
              </p>
            )}

            <div className="flex items-center gap-3 my-6 py-3 px-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-violet-400" />
                <span>{totalQuestions} Questions</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-violet-400/50" />
              <span>Instant Leaderboard</span>
            </div>

            <form onSubmit={handleStartQuiz} className="space-y-4">
              <div>
                <label
                  htmlFor="player-nickname-input"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2"
                >
                  Enter Your Nickname or Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-violet-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="player-nickname-input"
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value.slice(0, 30));
                      setNicknameError(null);
                    }}
                    placeholder="e.g. Maya, Chris, Liam..."
                    maxLength={30}
                    autoFocus
                    className="w-full min-h-[56px] pl-12 pr-4 py-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 text-[var(--text-primary)] font-bold text-base placeholder:text-[var(--text-muted)] outline-none transition-all"
                  />
                </div>
                {nicknameError && (
                  <p className="text-xs font-semibold text-rose-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{nicknameError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full min-h-[56px] py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-black text-base shadow-xl shadow-violet-600/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer glow-purple"
              >
                <span>Accept Challenge</span>
                <ArrowRight className="w-5 h-5 text-white/90" />
              </button>
            </form>
          </div>
        )}

        {/* ===================================================================
            STAGE 2: QUESTION DECK (56px touch targets, letter badges, glow)
            =================================================================== */}
        {stage === "playing" && currentQuestion && (
          <div className="w-full mt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Top Progress Indicator */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-2 px-1">
                <span className="uppercase tracking-wider">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span className="text-violet-400 font-bold">{progressPercent}% Complete</span>
              </div>
              <div className="w-full h-2 rounded-full bg-violet-500/20 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300 ease-out rounded-full"
                  style={{
                    width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="card-surface rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgb(0,0,0,0.18)]">
              <span className="text-[11px] font-black uppercase tracking-widest text-violet-300 bg-violet-500/15 border border-violet-500/30 px-3 py-1 rounded-full mb-3 inline-block">
                Question {currentQuestionIndex + 1}
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight leading-snug mb-6">
                {currentQuestion.text}
              </h2>

              {/* Options Deck (Minimum 56px touch target height) */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = selectedOptionId === option.id;
                  const letter = OPTION_LETTERS[optIdx] || `${optIdx + 1}`;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectOption(option.id)}
                      disabled={selectedOptionId !== null}
                      className={cn(
                        "w-full min-h-[56px] text-left px-5 py-4 rounded-2xl border transition-all flex items-center justify-between font-semibold text-[var(--text-primary)] cursor-pointer active:scale-[0.98]",
                        isSelected
                          ? "border-violet-500 bg-violet-500/20 ring-2 ring-violet-400/50 shadow-[0_0_24px_rgba(139,92,246,0.3)]"
                          : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-violet-500/40 hover:bg-violet-500/5",
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors",
                            isSelected
                              ? "bg-violet-600 text-white shadow-xs shadow-violet-600/30"
                              : "bg-violet-500/15 border border-violet-500/25 text-violet-300",
                          )}
                        >
                          {letter}
                        </div>
                        <span className="text-sm sm:text-base leading-snug">
                          {option.text}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-violet-600/40">
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            STAGE 3: SUBMITTING / SCORING
            =================================================================== */}
        {stage === "submitting" && (
          <div className="card-surface rounded-3xl p-8 mt-8 text-center animate-in fade-in zoom-in-95 duration-200 shadow-[0_12px_40px_rgb(0,0,0,0.18)]">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto mb-4 shadow-xs glow-purple">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mb-2">
              Scoring Your Answers...
            </h2>
            <p className="text-sm font-medium text-[var(--text-secondary)] max-w-sm mx-auto">
              Comparing your choices with {quiz.title}. Hold tight for your
              friendship verdict!
            </p>
          </div>
        )}

        {/* ===================================================================
            STAGE 4: ERROR STATE
            =================================================================== */}
        {stage === "error" && (
          <div className="card-surface rounded-3xl p-8 mt-8 text-center animate-in fade-in zoom-in-95 duration-200 shadow-[0_12px_40px_rgb(0,0,0,0.18)]">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
              Submission Notice
            </h2>
            <p className="text-sm font-medium text-[var(--text-secondary)] max-w-md mx-auto mb-6">
              {submitError || "Something went wrong while scoring your quiz."}
            </p>
            <button
              type="button"
              onClick={() => {
                setStage("nickname");
                setCurrentQuestionIndex(0);
                setAnswers([]);
                setSubmitError(null);
              }}
              className="min-h-[56px] py-3 px-8 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer glow-purple"
            >
              Start Over
            </button>
          </div>
        )}
      </div>

      {/* Discreet Footer with Report Option */}
      <footer className="mt-8 mb-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>LemonQuiz · Anonymous &amp; Safe</span>
        <button
          type="button"
          onClick={() => setIsReportOpen(true)}
          className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg active:scale-95"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Report this quiz</span>
        </button>
      </footer>

      {/* Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="card-surface rounded-3xl border border-[var(--card-border)] shadow-2xl max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={() => setIsReportOpen(false)}
              className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-xl transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Report This Quiz
              </h3>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  Report submitted. Thank you for keeping our community safe.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <input
                  type="text"
                  name="website"
                  value={reportHoneypot}
                  onChange={(e) => setReportHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="sr-only"
                  aria-hidden="true"
                />

                {reportError && (
                  <p className="text-xs font-semibold text-rose-400">
                    {reportError}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Reason
                  </label>
                  <div className="space-y-2">
                    {REPORT_REASONS.map((r) => (
                      <label
                        key={r.value}
                        className={cn(
                          "flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors min-h-[44px]",
                          reportReason === r.value
                            ? "border-violet-500 bg-violet-500/15 text-[var(--text-primary)] ring-1 ring-violet-500/30"
                            : "border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:border-violet-500/40",
                        )}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reportReason === r.value}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="sr-only"
                        />
                        <span>{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="report-description"
                    className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5"
                  >
                    Additional Details (Optional)
                  </label>
                  <textarea
                    id="report-description"
                    rows={2}
                    value={reportDescription}
                    onChange={(e) =>
                      setReportDescription(e.target.value.slice(0, 500))
                    }
                    placeholder="Provide any additional context..."
                    maxLength={500}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 text-[var(--text-primary)] outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="flex-1 min-h-[48px] py-2.5 px-4 rounded-xl border border-[var(--card-border)] text-[var(--text-secondary)] font-bold text-xs hover:bg-violet-500/10 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="flex-1 min-h-[48px] py-2.5 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReport ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Submit Report"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
