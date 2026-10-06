"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
  Heart,
} from "lucide-react";
import type { IQuizPublic } from "@/types/quiz";
import { cn } from "@/lib/utils";
import { getBrowserFingerprint } from "@/lib/fingerprint";
import { useRecaptchaV3 } from "@/hooks/useRecaptchaV3";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SelectionBox } from "@/components/ui/SelectionBox";
import { Heading, Text } from "@/components/ui/Typography";

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
  { value: "sexual", label: "Inappropriate Content" },
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
    matchedOwnerToken || null,
  );
  const [isOwnerDetected, setIsOwnerDetected] = useState<boolean>(
    Boolean(matchedOwnerToken),
  );
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(isPreview);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

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
      ? Math.round((currentQuestionIndex / totalQuestions) * 100)
      : 0;

  // Client-Side Owner Shield
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

            // Sync freshly discovered ownerToken to localStorage if missing
            try {
              if (!localTokens.includes(data.data.ownerToken)) {
                localTokens.unshift(data.data.ownerToken);
                localStorage.setItem(
                  "quiz_owner_tokens",
                  JSON.stringify(localTokens.slice(0, 50)),
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

  const handleCopyShareLink = () => {
    if (typeof window === "undefined") return;
    const shareUrl = `${window.location.origin}/q/${quiz.code}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopiedShareLink(true);
        setTimeout(() => setCopiedShareLink(false), 2000);
      })
      .catch((err) => console.warn("Failed to copy link:", err));
  };

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = nickname.trim();

    if (!cleanNick) {
      setNicknameError("Please enter your name or nickname to start");
      return;
    }

    if (cleanNick.length > 30) {
      setNicknameError("Nickname cannot exceed 30 characters");
      return;
    }

    setNickname(cleanNick);
    setNicknameError(null);
    startTimeRef.current = Date.now();
    setStage("playing");
  };

  const handleSelectOption = (optionId: string) => {
    if (selectedOptionId !== null) return; // Prevent double taps

    setSelectedOptionId(optionId);

    const updatedAnswers = [
      ...answers,
      { questionId: currentQuestion.id, optionId },
    ];
    setAnswers(updatedAnswers);

    // Smooth transition to next question or submission
    setTimeout(() => {
      if (currentQuestionIndex + 1 < totalQuestions) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedOptionId(null);
      } else {
        handleSubmitQuiz(updatedAnswers);
      }
    }, 280);
  };

  const handleSubmitQuiz = useCallback(
    async (finalAnswers: Array<{ questionId: string; optionId: string }>) => {
      setStage("submitting");
      setSubmitError(null);

      const durationSeconds = Math.max(3, Math.round((Date.now() - startTimeRef.current) / 1000));

      try {
        // Invisible reCAPTCHA v3 verification
        const recaptchaToken = await executeRecaptcha("submit_attempt");

        const payload = {
          nickname: nickname.trim(),
          answers: finalAnswers,
          durationSeconds,
          website: honeypot, // Honeypot anti-bot
          recaptchaToken: recaptchaToken || undefined,
        };

        const response = await fetch(`/api/quizzes/${quiz.code}/attempts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to submit answers. Please try again.");
        }

        // Navigate to results screen
        const attemptCode = data.data.attemptCode;
        router.push(`/q/${quiz.code}/result/${attemptCode}`);
      } catch (err: unknown) {
        console.error("Quiz submission error:", err);
        const errorMsg =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again.";
        setSubmitError(errorMsg);
        setStage("error");
      }
    },
    [executeRecaptcha, honeypot, nickname, quiz.code, router],
  );

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    setReportError(null);

    try {
      const recaptchaToken = await executeRecaptcha("submit_report");

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.code,
          reason: reportReason,
          description: reportDescription.trim() || undefined,
          website: reportHoneypot,
          recaptchaToken: recaptchaToken || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
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
        {/* OWNER WELCOME SCREEN */}
        {isOwnerDetected && !isPreviewMode ? (
          <Card className="rounded-3xl p-6 sm:p-8 mt-4 animate-in fade-in zoom-in-95 duration-200 text-center space-y-6">
            <div className="pill-badge">
              <Crown className="w-4 h-4 text-[#C99B62]" />
              <span>Owner Detected</span>
            </div>

            <div className="space-y-2">
              <Heading level={1} className="text-2xl sm:text-3xl font-black">
                You Created This Quiz!
              </Heading>
              <Text className="text-sm sm:text-base font-medium max-w-md mx-auto">
                You don&apos;t need to take your own quiz. Your friends&apos; live rankings, answers, and scores are in your dashboard.
              </Text>
            </div>

            <div className="space-y-3 pt-2">
              {ownerToken && (
                <Link href={`/manage/${ownerToken}`} className="block w-full">
                  <Button
                    variant="premium"
                    size="lg"
                    fullWidth
                    leftIcon={<KeyRound className="w-5 h-5 text-[#241C24]" />}
                    rightIcon={<ArrowRight className="w-5 h-5 text-[#241C24]" />}
                  >
                    Go to Owner Dashboard
                  </Button>
                </Link>
              )}

              <Button
                type="button"
                variant="secondary"
                size="lg"
                fullWidth
                onClick={handleCopyShareLink}
                leftIcon={
                  copiedShareLink ? (
                    <Check className="w-5 h-5 text-[var(--accent-sage)]" />
                  ) : (
                    <Share2 className="w-5 h-5 text-[var(--color-plum)]" />
                  )
                }
              >
                {copiedShareLink ? "Share Link Copied!" : "Copy Share Link"}
              </Button>

              <button
                type="button"
                onClick={() => setIsPreviewMode(true)}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-plum)]/5 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[var(--color-plum)]" />
                <span>Take Quiz in Preview Mode</span>
              </button>
            </div>
          </Card>
        ) : (
          <>
            {/* Owner Preview Banner if playing in preview mode */}
            {isOwnerDetected && isPreviewMode && (
              <div className="mb-4 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--color-plum)]/25 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
                  <Crown className="w-4 h-4 text-[#C99B62] shrink-0" />
                  <span>Owner Preview Mode</span>
                </div>
                {ownerToken && (
                  <Link
                    href={`/manage/${ownerToken}`}
                    className="px-3 py-1.5 rounded-xl bg-[var(--color-plum)] text-white font-bold transition-all flex items-center gap-1 shrink-0 active:scale-95"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}

            {/* STAGE 1: NICKNAME ENTRY CARD */}
            {stage === "nickname" && (
              <Card className="rounded-3xl p-6 sm:p-8 mt-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center mb-3">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3 flex items-center justify-center">
                    <Image
                      src="/Cozy Lemon Quiz Break.webp"
                      alt="Cozy Lemon Quiz Break"
                      width={112}
                      height={112}
                      priority
                      className="w-full h-full object-contain drop-shadow-xs"
                    />
                  </div>
                </div>

                <div className="pill-badge mb-4">
                  <Heart className="w-3.5 h-3.5 text-[var(--accent-rose)] fill-[var(--accent-rose)]" />
                  <span>Friendship Challenge</span>
                </div>

                <Heading level={1} className="text-2xl sm:text-3xl font-black">
                  {quiz.title}
                </Heading>

                {quiz.description && (
                  <Text className="text-sm sm:text-base font-medium mt-2 leading-relaxed">
                    {quiz.description}
                  </Text>
                )}

                <div className="flex items-center gap-3 my-6 py-3 px-4 rounded-2xl bg-[var(--color-plum)]/5 border border-[var(--color-plum)]/15 text-xs font-semibold text-[var(--color-plum)]">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[var(--color-plum)]" />
                    <span>{totalQuestions} Questions</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-[var(--color-plum)]/40" />
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
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-plum)]">
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
                        className="w-full min-h-[56px] pl-12 pr-4 py-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-[var(--color-plum)] focus:ring-2 focus:ring-[var(--color-plum)]/20 text-[var(--text-primary)] font-bold text-base placeholder:text-[var(--text-muted)] outline-none transition-all"
                      />
                    </div>
                    {nicknameError && (
                      <p className="text-xs font-semibold text-rose-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{nicknameError}</span>
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    rightIcon={<ArrowRight className="w-5 h-5 text-white/90" />}
                  >
                    Accept Challenge
                  </Button>
                </form>
              </Card>
            )}

            {/* STAGE 2: QUESTION DECK */}
            {stage === "playing" && currentQuestion && (
              <div className="w-full mt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {/* Top Progress Indicator */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-2 px-1">
                    <span className="uppercase tracking-wider">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <span className="text-[var(--color-plum)] font-bold">
                      {progressPercent}% Complete
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--color-plum)]/15 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--color-plum)] to-[var(--accent-rose)] transition-all duration-300 ease-out rounded-full"
                      style={{
                        width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Question Card */}
                <Card className="rounded-3xl p-5 sm:p-8">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-plum)] bg-[var(--color-plum)]/10 border border-[var(--color-plum)]/20 px-3 py-1 rounded-full mb-3 inline-block">
                    Question {currentQuestionIndex + 1}
                  </span>

                  <Heading level={2} className="text-xl sm:text-2xl font-black mb-6 break-words">
                    {currentQuestion.text}
                  </Heading>

                  {/* Standardized SelectionBox Options (min 56px touch target) */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, optIdx) => {
                      const isSelected = selectedOptionId === option.id;
                      const letter = OPTION_LETTERS[optIdx] || `${optIdx + 1}`;

                      return (
                        <SelectionBox
                          key={option.id}
                          isSelected={isSelected}
                          letterChip={letter}
                          indicatorType="radio"
                          onClick={() => handleSelectOption(option.id)}
                          disabled={selectedOptionId !== null}
                          className="min-h-[56px] text-sm sm:text-base font-bold"
                        >
                          <span className="leading-snug break-words">
                            {option.text}
                          </span>
                        </SelectionBox>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* STAGE 3: SUBMITTING / SCORING */}
            {stage === "submitting" && (
              <Card className="rounded-3xl p-8 mt-8 text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-4">
                  <Image
                    src="/submitting-pulse.svg"
                    alt="Scoring answers"
                    width={80}
                    height={80}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto animate-pulse drop-shadow-md"
                  />
                </div>
                <Heading level={2} className="text-2xl font-black mb-2">
                  Scoring Your Answers...
                </Heading>
                <Text className="text-sm font-medium max-w-sm mx-auto">
                  Comparing your choices with {quiz.title}. Hold tight for your friendship verdict!
                </Text>
              </Card>
            )}

            {/* STAGE 4: ERROR STATE */}
            {stage === "error" && (
              <Card className="rounded-3xl p-8 mt-8 text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <Heading level={2} className="text-xl font-bold mb-2">
                  Submission Notice
                </Heading>
                <Text className="text-sm font-medium max-w-md mx-auto mb-6">
                  {submitError || "Something went wrong while scoring your quiz."}
                </Text>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setStage("nickname");
                    setCurrentQuestionIndex(0);
                    setAnswers([]);
                    setSubmitError(null);
                  }}
                >
                  Start Over
                </Button>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Discreet Footer with Report Option */}
      <footer className="mt-8 mb-4 pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-center sm:text-left">
          <span>LemonQuiz &bull; Anonymous &amp; Safe</span>
          <span className="hidden sm:inline">&bull;</span>
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
            {" &bull; "}
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
          className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-rose-500 transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg active:scale-95"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Report Content</span>
        </button>
      </footer>

      {/* Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-500">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">
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
                <CheckCircle2 className="w-10 h-10 text-[var(--accent-sage)] mx-auto" />
                <p className="font-bold text-sm text-[var(--text-primary)]">
                  Report Received
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Thank you for keeping LemonQuiz safe. Our moderators will review
                  this quiz shortly.
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

                {reportError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reportError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Reason for report
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {REPORT_REASONS.map((r) => (
                      <label
                        key={r.value}
                        className={cn(
                          "flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors min-h-[44px]",
                          reportReason === r.value
                            ? "border-[var(--color-plum)] bg-[var(--color-plum)]/10 text-[var(--text-primary)] ring-1 ring-[var(--color-plum)]/30"
                            : "border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:border-[var(--color-plum)]/30",
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
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-[var(--color-plum)] focus:ring-2 focus:ring-[var(--color-plum)]/20 text-[var(--text-primary)] outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="flex-1"
                    onClick={() => setIsReportOpen(false)}
                  >
                    Cancel
                  </Button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="flex-1 min-h-[48px] py-2.5 px-4 rounded-2xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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
          </Card>
        </div>
      )}
    </div>
  );
}
