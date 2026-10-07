"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Crown,
  KeyRound,
  Share2,
  Check,
  Eye,
  Zap,
} from "lucide-react";
import type { IQuizPublic } from "@/types/quiz";
import { cn } from "@/lib/utils";
import { getBrowserFingerprint } from "@/lib/fingerprint";
import { useRecaptchaV3 } from "@/hooks/useRecaptchaV3";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface QuizPlayerProps {
  quiz: IQuizPublic;
  matchedOwnerToken?: string;
  isPreview?: boolean;
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

export function QuizPlayer({
  quiz,
  matchedOwnerToken,
  isPreview = false,
}: QuizPlayerProps) {
  const router = useRouter();
  const { executeRecaptcha } = useRecaptchaV3();

  // Owner recognition state
  const [ownerToken, setOwnerToken] = useState<string | null>(
    matchedOwnerToken || null
  );
  const [isOwnerDetected, setIsOwnerDetected] = useState<boolean>(
    Boolean(matchedOwnerToken)
  );
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(isPreview);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Stage: "nickname" | "playing" | "submitting" | "error"
  const [stage, setStage] = useState<
    "nickname" | "playing" | "submitting" | "error"
  >("nickname");

  // Participant details
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  // Quiz progression state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Array<{ questionId: string; optionId: string }>
  >([]);
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

  // Client-Side Owner Shield Check
  useEffect(() => {
    let isMounted = true;

    async function checkOwnerShield() {
      if (matchedOwnerToken) return;

      try {
        if (typeof window === "undefined") return;

        const raw = localStorage.getItem("quiz_owner_tokens");
        const localTokens: string[] = raw ? JSON.parse(raw) : [];
        const fp = await getBrowserFingerprint();

        if ((localTokens.length > 0 || fp) && isMounted) {
          const res = await fetch(`/api/quizzes/${quiz.code}/owner-check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tokens: localTokens,
              clientFingerprint: fp || undefined,
            }),
          });

          const data = await res.json();
          if (
            isMounted &&
            data.success &&
            data.data?.isOwner &&
            data.data?.ownerToken
          ) {
            setOwnerToken(data.data.ownerToken);
            setIsOwnerDetected(true);

            try {
              if (!localTokens.includes(data.data.ownerToken)) {
                localTokens.unshift(data.data.ownerToken);
                localStorage.setItem(
                  "quiz_owner_tokens",
                  JSON.stringify(localTokens.slice(0, 50))
                );
              }
            } catch (storageErr) {
              console.warn("Could not save token to localStorage:", storageErr);
            }
          }
        }
      } catch (err) {
        console.warn("Client owner shield check error:", err);
      }
    }

    checkOwnerShield();

    return () => {
      isMounted = false;
    };
  }, [quiz.code, matchedOwnerToken]);

  const handleCopyShareLink = async () => {
    try {
      if (typeof window !== "undefined") {
        const url = `${window.location.origin}/q/${quiz.code}`;
        await navigator.clipboard.writeText(url);
        setCopiedShareLink(true);
        setTimeout(() => setCopiedShareLink(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy share link:", err);
    }
  };

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setNicknameError(
        "Please enter your nickname so your squad recognizes you!"
      );
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

  const handleSubmitQuiz = React.useCallback(
    async (finalAnswers: Array<{ questionId: string; optionId: string }>) => {
      setStage("submitting");
      setSubmitError(null);

      const elapsedSeconds = Math.round(
        (Date.now() - startTimeRef.current) / 1000
      );

      try {
        const recaptchaToken = await executeRecaptcha("submit_attempt");

        const response = await fetch(`/api/quizzes/${quiz.code}/attempts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nickname: nickname.trim(),
            answers: finalAnswers,
            durationSeconds: elapsedSeconds,
            website: honeypot,
            recaptchaToken: recaptchaToken || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          if (response.status === 403) {
            throw new Error(
              data.error ||
                "You have reached the maximum number of attempts allowed for this quiz."
            );
          }
          if (response.status === 429) {
            throw new Error(
              data.error ||
                "Whoa speedster! 🏎️ Please wait a few minutes before trying again."
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
    [executeRecaptcha, honeypot, nickname, quiz.code, router]
  );

  const handleSelectOption = (optionId: string) => {
    if (selectedOptionId !== null || stage !== "playing") return;

    setSelectedOptionId(optionId);

    const updatedAnswers = [
      ...answers.filter((a) => a.questionId !== currentQuestion.id),
      { questionId: currentQuestion.id, optionId },
    ];
    setAnswers(updatedAnswers);

    setTimeout(() => {
      setSelectedOptionId(null);

      if (currentQuestionIndex + 1 < totalQuestions) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        handleSubmitQuiz(updatedAnswers);
      }
    }, 220);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    setReportError(null);

    try {
      const recaptchaToken = await executeRecaptcha("submit_report");

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
          recaptchaToken: recaptchaToken || undefined,
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
      const msg =
        err instanceof Error ? err.message : "Error submitting report.";
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
            OWNER WELCOME SCREEN (When owner detected & not in preview)
            =================================================================== */}
        {isOwnerDetected && !isPreviewMode ? (
          <div className="card-surface rounded-3xl p-6 sm:p-8 mt-4 text-center space-y-6 border-2 border-[var(--card-border)]">
            <div className="flex justify-center">
              <Badge variant="lemon" tilt="left">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Quiz Creator Detected</span>
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                You Created This Quiz! 💖
              </h1>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base font-medium max-w-md mx-auto leading-relaxed">
                You don&apos;t need to take your own quiz. Your squad&apos;s live rankings, answers, and scores are waiting in your dashboard.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {ownerToken && (
                <Link href={`/manage/${ownerToken}`} className="block">
                  <Button variant="lemon" size="lg" fullWidth>
                    <KeyRound className="w-5 h-5 text-[#2D1B0E]" />
                    <span>Open Squad Leaderboard</span>
                    <ArrowRight className="w-5 h-5 text-[#2D1B0E]" />
                  </Button>
                </Link>
              )}

              <Button
                type="button"
                variant="ghost"
                size="lg"
                fullWidth
                onClick={handleCopyShareLink}
              >
                {copiedShareLink ? (
                  <>
                    <Check className="w-5 h-5 text-[#1EAA78]" />
                    <span className="text-emerald-400 font-bold">
                      Share Link Copied! 💕
                    </span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5 text-[#FFB830]" />
                    <span>Copy Share Link</span>
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => setIsPreviewMode(true)}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#B47AFF]" />
                <span>Play in Test Preview Mode</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Owner Preview Banner if playing in preview mode */}
            {isOwnerDetected && isPreviewMode && (
              <div className="mb-4 p-3 rounded-2xl bg-[#FFB830]/15 border-2 border-[#FFB830]/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#E67700] font-bold">
                  <Crown className="w-4 h-4 text-[#FFB830] shrink-0" />
                  <span>Owner Preview Mode</span>
                </div>
                {ownerToken && (
                  <Link
                    href={`/manage/${ownerToken}`}
                    className="px-3 py-1.5 rounded-xl bg-[#FFB830] text-[#2D1B0E] font-black transition-all flex items-center gap-1 shrink-0 active:scale-95 shadow-[0_2px_0_#E09800]"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}

            {/* ===================================================================
                STAGE 1: NICKNAME ENTRY CARD
                =================================================================== */}
            {stage === "nickname" && (
              <div className="card-surface rounded-3xl p-6 sm:p-8 mt-4 space-y-6">
                <div className="flex items-center justify-between">
                  <Badge variant="lemon" tilt="left">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFB830]" />
                    <span>Friendship Challenge</span>
                  </Badge>
                  <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-wider">
                    {totalQuestions} Questions ⚡
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                    {quiz.title}
                  </h1>

                  {quiz.description && (
                    <p className="text-[var(--text-secondary)] text-sm sm:text-base font-medium leading-relaxed">
                      {quiz.description}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-[var(--card-bg)] border-2 border-[var(--card-border)] flex items-center justify-between text-xs sm:text-sm font-bold text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⏱️</span>
                    <span>Takes ~45 seconds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏆</span>
                    <span>Live Leaderboard</span>
                  </div>
                </div>

                <form onSubmit={handleStartQuiz} className="space-y-4">
                  <div>
                    <label
                      htmlFor="player-nickname-input"
                      className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-2"
                    >
                      Enter Your Nickname or IG Handle
                    </label>
                    <Input
                      id="player-nickname-input"
                      value={nickname}
                      onChange={(e) => {
                        setNickname(e.target.value.slice(0, 30));
                        setNicknameError(null);
                      }}
                      placeholder="e.g. Zack, Maya, The Bestie..."
                      maxLength={30}
                      autoFocus
                      error={nicknameError}
                      icon={<User className="w-5 h-5 text-[#FFB830]" />}
                    />
                  </div>

                  <Button type="submit" variant="lemon" size="lg" fullWidth>
                    <span>Start Challenge ⚡</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            )}

            {/* ===================================================================
                STAGE 2: QUESTION GAMEPLAY STACK
                =================================================================== */}
            {stage === "playing" && currentQuestion && (
              <div className="w-full mt-2 space-y-4">
                {/* Top HUD Progress Bar */}
                <ProgressBar
                  current={currentQuestionIndex + 1}
                  total={totalQuestions}
                />

                {/* Active Question Card */}
                <div className="card-surface rounded-3xl p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge variant="violet" tilt="right">
                      <span>Question {currentQuestionIndex + 1}</span>
                    </Badge>
                    <span className="text-xs font-bold text-[var(--text-muted)]">
                      Tap your answer 👇
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight leading-snug">
                    {currentQuestion.text}
                  </h2>

                  {/* 4 Chunky Tactile Option Cards */}
                  <div className="space-y-3 pt-1">
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
                            "w-full min-h-[60px] text-left px-5 py-4 rounded-2xl border-2 transition-all flex items-center justify-between font-bold text-base sm:text-lg cursor-pointer select-none",
                            isSelected
                              ? "bg-[#FFB830] text-[#2D1B0E] border-[#E09800] shadow-[0_1px_0_#E09800] translate-y-[3px]"
                              : "bg-[var(--card-bg)] text-[var(--text-primary)] border-[var(--card-border)] shadow-[var(--shadow-tactile)] hover:border-[#FFB830]/60 hover:bg-[#FFB830]/5 active:translate-y-[3px] active:shadow-none"
                          )}
                        >
                          <div className="flex items-center gap-3.5 pr-2">
                            <span
                              className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-colors",
                                isSelected
                                  ? "bg-[#2D1B0E] text-[#FFB830]"
                                  : "bg-[#FFB830]/15 text-[#E67700] border border-[#FFB830]/30"
                              )}
                            >
                              {letter}
                            </span>
                            <span className="leading-snug">{option.text}</span>
                          </div>

                          <div
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                              isSelected
                                ? "border-[#2D1B0E] bg-[#2D1B0E] text-[#FFB830]"
                                : "border-[var(--card-border)]"
                            )}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================
                STAGE 3: SUSPENSE SCORING LOADER
                =================================================================== */}
            {stage === "submitting" && (
              <div className="card-surface rounded-3xl p-8 mt-8 text-center space-y-5 border-2 border-[var(--card-border)]">
                <div className="w-20 h-20 rounded-3xl bg-[#FFB830]/15 border-2 border-[#FFB830]/30 text-[#FFB830] flex items-center justify-center mx-auto shadow-inner text-4xl animate-bounce">
                  🍋
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                    Calculating Friendship IQ... 💫
                  </h2>
                  <p className="text-sm font-semibold text-[var(--text-secondary)] max-w-sm mx-auto">
                    Comparing your answers with {quiz.title}. Hold tight for the squad verdict!
                  </p>
                </div>
                <div className="flex justify-center pt-2">
                  <Loader2 className="w-6 h-6 text-[#FFB830] animate-spin" />
                </div>
              </div>
            )}

            {/* ===================================================================
                STAGE 4: ERROR / RETRY
                =================================================================== */}
            {stage === "error" && (
              <div className="card-surface rounded-3xl p-8 mt-8 text-center space-y-5 border-2 border-[var(--card-border)]">
                <div className="w-16 h-16 rounded-2xl bg-[#FF6B8A]/15 border-2 border-[#FF6B8A]/30 text-[#E0456B] flex items-center justify-center mx-auto text-3xl">
                  ⚠️
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                    Submission Notice
                  </h2>
                  <p className="text-sm font-medium text-[var(--text-secondary)] max-w-md mx-auto">
                    {submitError || "Something went wrong while scoring your quiz."}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="violet"
                  size="md"
                  onClick={() => {
                    setStage("nickname");
                    setCurrentQuestionIndex(0);
                    setAnswers([]);
                    setSubmitError(null);
                  }}
                >
                  Start Over
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Discreet Footer with Safety Report Option */}
      <footer className="mt-8 mb-4 pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-center sm:text-left">
          <span>LemonQuiz · Anonymous &amp; Safe</span>
          <span className="hidden sm:inline">·</span>
          <span className="text-[10px] text-[var(--text-muted)]">
            Protected by reCAPTCHA (
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-[var(--text-primary)]"
            >
              Privacy
            </a>
            {" · "}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-[var(--text-primary)]"
            >
              Terms
            </a>
            )
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsReportOpen(true)}
          className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg active:scale-95"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Report Content</span>
        </button>
      </footer>

      {/* Safety Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="card-surface rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-black text-base text-[var(--text-primary)]">
                  Report This Quiz
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="font-black text-sm text-[var(--text-primary)]">
                  Report Received ✨
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Thank you for keeping LemonQuiz safe. Our moderators will review this quiz.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <input
                  type="text"
                  name="reportWebsite"
                  value={reportHoneypot}
                  onChange={(e) => setReportHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="sr-only"
                  aria-hidden="true"
                />

                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-[var(--text-secondary)]">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full h-12 bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--text-primary)] font-bold rounded-2xl px-4 text-sm outline-none focus:border-[#FFB830]"
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r.value} value={r.value} className="bg-white">
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-[var(--text-secondary)]">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) =>
                      setReportDescription(e.target.value.slice(0, 500))
                    }
                    placeholder="Briefly describe the issue..."
                    rows={3}
                    maxLength={500}
                    className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--text-primary)] font-medium rounded-2xl p-4 text-sm outline-none focus:border-[#FFB830]"
                  />
                </div>

                {reportError && (
                  <p className="text-xs font-bold text-rose-400">{reportError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    className="flex-1"
                    onClick={() => setIsReportOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="coral"
                    size="md"
                    className="flex-1"
                    disabled={isSubmittingReport}
                  >
                    {isSubmittingReport ? "Sending..." : "Submit Report"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
