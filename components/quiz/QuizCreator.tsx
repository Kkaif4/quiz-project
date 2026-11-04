"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Plus,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Sliders,
  User as UserIcon,
  Crown,
} from "lucide-react";
import { TEMPLATES, getTemplateById, type QuizTemplate } from "@/lib/templates";
import { QuestionEditor, type QuestionEditorData } from "./QuestionEditor";
import { cn } from "@/lib/utils";
import type { QuizCreationResult } from "@/types/quiz";
import { getBrowserFingerprint } from "@/lib/fingerprint";
import { useRecaptchaV3 } from "@/hooks/useRecaptchaV3";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { StickerPill } from "@/components/ui/StickerPill";

interface QuizCreatorProps {
  initialTemplateId?: string;
}

type WizardStage = "setup" | "wizard" | "review";

export function QuizCreator({ initialTemplateId }: QuizCreatorProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { executeRecaptcha } = useRecaptchaV3();

  const defaultTemplate =
    (initialTemplateId && getTemplateById(initialTemplateId)) || TEMPLATES[0];

  const [creatorName, setCreatorName] = useState<string>("");
  const [clientFingerprint, setClientFingerprint] = useState<string>("");
  const [, setIsIdentifiedUser] = useState<boolean>(false);
  const [hasCustomizedTitle, setHasCustomizedTitle] = useState<boolean>(false);

  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    defaultTemplate ? defaultTemplate.id : "best-friends"
  );
  const [title, setTitle] = useState<string>(
    defaultTemplate ? defaultTemplate.title : "How Well Do You Know Me?"
  );
  const [description, setDescription] = useState<string>(
    defaultTemplate ? defaultTemplate.description : ""
  );
  const [questions, setQuestions] = useState<QuestionEditorData[]>(
    defaultTemplate
      ? defaultTemplate.questions.map((q) => ({
          ...q,
          options: q.options.map((o) => ({ ...o })),
        }))
      : [
          createEmptyQuestion(1),
          createEmptyQuestion(2),
          createEmptyQuestion(3),
        ]
  );

  const [stage, setStage] = useState<WizardStage>("setup");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const [honeypot, setHoneypot] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccessRedirecting, setIsSuccessRedirecting] = useState<boolean>(false);
  const [createdManageUrl, setCreatedManageUrl] = useState<string>("");

  function createEmptyQuestion(num: number): QuestionEditorData {
    const qId = `q_${Date.now()}_${num}`;
    return {
      id: qId,
      text: "",
      type: "single",
      options: [
        { id: `opt_${Date.now()}_1`, text: "" },
        { id: `opt_${Date.now()}_2`, text: "" },
        { id: `opt_${Date.now()}_3`, text: "" },
        { id: `opt_${Date.now()}_4`, text: "" },
      ],
      correctOptionId: `opt_${Date.now()}_1`,
    };
  }

  useEffect(() => {
    let isMounted = true;
    async function detectBlueprint() {
      try {
        const fp = await getBrowserFingerprint();
        if (!isMounted) return;
        setClientFingerprint(fp);

        if (fp) {
          const res = await fetch("/api/users/identify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientFingerprint: fp }),
          });
          const data = await res.json();
          if (isMounted && data.success && data.data?.user?.name) {
            const userName = data.data.user.name;
            setCreatorName(userName);
            setIsIdentifiedUser(true);
            setTitle((prev) =>
              prev === "How Well Do You Know Me?" || !prev
                ? `How Well Do You Know ${userName}?`
                : prev
            );
          }
        }
      } catch (err) {
        console.warn("Could not identify user blueprint on creator mount:", err);
      }
    }
    detectBlueprint();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreatorNameChange = (val: string) => {
    const trimmedVal = val.slice(0, 50);
    setCreatorName(trimmedVal);
    setErrorMessage(null);
    if (!hasCustomizedTitle) {
      if (trimmedVal.trim()) {
        setTitle(`How Well Do You Know ${trimmedVal.trim()}?`);
      } else {
        setTitle("How Well Do You Know Me?");
      }
    }
  };

  const handleSelectTemplate = (template: QuizTemplate) => {
    setActiveTemplateId(template.id);
    setTitle(template.title);
    setDescription(template.description);
    setQuestions(
      template.questions.map((q) => ({
        ...q,
        options: q.options.map((o) => ({ ...o })),
      }))
    );
    setErrorMessage(null);
  };

  const handleUpdateQuestion = (
    index: number,
    updated: QuestionEditorData
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = updated;
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 3) return;
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    if (currentQuestionIndex >= updated.length) {
      setCurrentQuestionIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleAddQuestion = () => {
    if (questions.length >= 15) return;
    const newQ = createEmptyQuestion(questions.length + 1);
    setQuestions([...questions, newQ]);
    setCurrentQuestionIndex(questions.length);
  };

  const validateCurrentQuestion = (index: number): string | null => {
    const q = questions[index];
    if (!q) return "Question not found.";
    if (!q.text.trim()) {
      return `Please enter text for Question ${index + 1}.`;
    }
    if (q.options.length < 2) {
      return `Question ${index + 1} must have at least 2 options.`;
    }
    for (let j = 0; j < q.options.length; j++) {
      if (!q.options[j].text.trim()) {
        return `Question ${index + 1}, Option ${j + 1} is empty.`;
      }
    }
    const hasCorrect = q.options.some((opt) => opt.id === q.correctOptionId);
    if (!hasCorrect) {
      return `Question ${index + 1} must have a secret correct answer selected.`;
    }
    return null;
  };

  const validateAll = (): string | null => {
    const cleanName = creatorName.trim();
    if (!cleanName) {
      return "Please enter your nickname or name before launching your quiz.";
    }
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      return "Please provide a title for your quiz.";
    }
    if (cleanTitle.length > 100) {
      return "Quiz title cannot exceed 100 characters.";
    }
    if (questions.length < 3) {
      return "Your quiz must have at least 3 questions.";
    }
    if (questions.length > 15) {
      return "Your quiz cannot have more than 15 questions.";
    }

    for (let i = 0; i < questions.length; i++) {
      const err = validateCurrentQuestion(i);
      if (err) return err;
    }

    return null;
  };

  const handleStartCustomizing = () => {
    const cleanName = creatorName.trim();
    if (!cleanName) {
      setErrorMessage("Please enter your name first before continuing.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMessage("Please enter a title for your quiz before continuing.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrorMessage(null);
    setCurrentQuestionIndex(0);
    setStage("wizard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextQuestion = () => {
    const err = validateCurrentQuestion(currentQuestionIndex);
    if (err) {
      setErrorMessage(err);
      return;
    }
    setErrorMessage(null);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStage("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePreviousQuestion = () => {
    setErrorMessage(null);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStage("setup");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setErrorMessage(null);
    setCurrentQuestionIndex(index);
    setStage("wizard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePublishQuiz = async () => {
    const validationError = validateAll();
    if (validationError) {
      setErrorMessage(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const recaptchaToken = await executeRecaptcha("create_quiz");

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        creatorName: creatorName.trim(),
        clientFingerprint: clientFingerprint || undefined,
        website: honeypot,
        recaptchaToken: recaptchaToken || undefined,
        questions: questions.map((q) => ({
          id: q.id,
          text: q.text.trim(),
          type: q.type,
          options: q.options.map((opt) => ({
            id: opt.id,
            text: opt.text.trim(),
          })),
          correctOptionId: q.correctOptionId,
        })),
      };

      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 429) {
          throw new Error(
            data.error ||
              "Whoa speedster! 🏎️ Quiz creation limit reached for this hour. Please wait a bit."
          );
        }
        throw new Error(data.error || "Failed to create quiz.");
      }

      const result: QuizCreationResult = data.data;

      try {
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("quiz_owner_tokens");
          const tokens: string[] = raw ? JSON.parse(raw) : [];
          if (!tokens.includes(result.ownerToken)) {
            tokens.unshift(result.ownerToken);
            localStorage.setItem(
              "quiz_owner_tokens",
              JSON.stringify(tokens.slice(0, 50))
            );
          }
        }
      } catch (storageErr) {
        console.warn("Could not mirror ownerToken to localStorage:", storageErr);
      }

      setIsSuccessRedirecting(true);
      setCreatedManageUrl(result.manageUrl);

      startTransition(() => {
        router.push(result.manageUrl);
      });
    } catch (err: unknown) {
      console.error("Quiz creation error:", err);
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
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

      {/* Wizard Step Progression Bar */}
      <div className="card-surface rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 w-full sm:w-auto">
          <Badge
            variant={stage === "setup" ? "lemon" : "slate"}
            onClick={() => setStage("setup")}
            className="cursor-pointer px-2.5 py-1 text-[10px] sm:text-xs"
          >
            1. Setup ✏️
          </Badge>
          <span className="text-[var(--text-muted)] font-black text-xs hidden sm:inline">→</span>
          <Badge
            variant={stage === "wizard" ? "lemon" : "slate"}
            onClick={() => {
              if (creatorName.trim()) setStage("wizard");
            }}
            className="cursor-pointer px-2.5 py-1 text-[10px] sm:text-xs"
          >
            2. Qs ({questions.length}) ⚡
          </Badge>
          <span className="text-[var(--text-muted)] font-black text-xs hidden sm:inline">→</span>
          <Badge
            variant={stage === "review" ? "lemon" : "slate"}
            onClick={() => {
              if (creatorName.trim()) setStage("review");
            }}
            className="cursor-pointer px-2.5 py-1 text-[10px] sm:text-xs"
          >
            3. Review 🚀
          </Badge>
        </div>

        <span className="text-xs font-black text-[#E67700] hidden sm:inline">
          60s Creator ✨
        </span>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-[#FF6B8A]/15 border-2 border-[#FF6B8A]/30 text-[#E0456B] flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-[#FF6B8A] shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-bold">{errorMessage}</div>
        </div>
      )}

      {/* =====================================================================
          STAGE 1: SETUP & IDENTITY
          ===================================================================== */}
      {stage === "setup" && (
        <div className="space-y-6">
          <div className="card-surface rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <Badge variant="lemon" tilt="left">
                <Crown className="w-3.5 h-3.5 text-[#2D1B0E]" />
                <span>Step 1: Your Identity</span>
              </Badge>
              <span className="text-xs font-bold text-[var(--text-muted)]">
                Takes 60 seconds ⏱️
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                Who is this quiz about?
              </h1>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                Your friends will see your name when opening your challenge.
              </p>
            </div>

            {/* Creator Name Input */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
                Your Nickname or Name
              </label>
              <Input
                value={creatorName}
                onChange={(e) => handleCreatorNameChange(e.target.value)}
                placeholder="e.g. Kaif, Sarah, The Squad MVP..."
                maxLength={50}
                autoFocus
                icon={<UserIcon className="w-5 h-5 text-[#FFB830]" />}
              />
            </div>

            {/* Quiz Title Input */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
                Quiz Title
              </label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value.slice(0, 100));
                  setHasCustomizedTitle(true);
                  setErrorMessage(null);
                }}
                placeholder="How Well Do You Know Me?"
                maxLength={100}
              />
            </div>

            {/* Vibe Templates Carousel */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
                Pick a Starter Question Vibe
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATES.map((tmpl) => (
                  <StickerPill
                    key={tmpl.id}
                    label={tmpl.title}
                    emoji={
                      tmpl.id === "best-friends"
                        ? "👑"
                        : tmpl.id === "secrets-deep"
                        ? "🔮"
                        : tmpl.id === "dating-crush"
                        ? "💖"
                        : "⚡"
                    }
                    selected={activeTemplateId === tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="justify-start py-3"
                  />
                ))}
              </div>
            </div>

            {/* Next Step Button */}
            <Button
              type="button"
              variant="lemon"
              size="lg"
              fullWidth
              onClick={handleStartCustomizing}
            >
              <span>Next: Set Answers ➡️</span>
            </Button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STAGE 2: WIZARD QUESTION EDITOR
          ===================================================================== */}
      {stage === "wizard" && questions[currentQuestionIndex] && (
        <div className="space-y-6">
          <QuestionEditor
            index={currentQuestionIndex}
            question={questions[currentQuestionIndex]}
            totalQuestions={questions.length}
            onUpdateQuestion={(updated) =>
              handleUpdateQuestion(currentQuestionIndex, updated)
            }
            onDeleteQuestion={() => handleDeleteQuestion(currentQuestionIndex)}
          />

          {/* Navigation Controls */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="md"
              className="w-full sm:w-auto"
              onClick={handlePreviousQuestion}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentQuestionIndex === 0 ? "Back to Setup" : "Previous"}</span>
            </Button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {questions.length < 15 && currentQuestionIndex === questions.length - 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={handleAddQuestion}
                >
                  <Plus className="w-4 h-4 text-[#FFB830]" />
                  <span>Add Question</span>
                </Button>
              )}

              <Button
                type="button"
                variant="lemon"
                size="md"
                className="w-full sm:w-auto"
                onClick={handleNextQuestion}
              >
                <span>
                  {currentQuestionIndex + 1 === questions.length
                    ? "Review & Launch 🚀"
                    : "Next Question ➡️"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STAGE 3: REVIEW & PUBLISH
          ===================================================================== */}
      {stage === "review" && (
        <div className="card-surface rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="lemon" tilt="right">
              <Sparkles className="w-3.5 h-3.5 text-[#2D1B0E]" />
              <span>Ready to Launch</span>
            </Badge>
            <span className="text-xs font-black text-[#E67700]">
              {questions.length} Questions Ready
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              {title}
            </h2>
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              By {creatorName} • Ready for WhatsApp &amp; Instagram Stories
            </p>
          </div>

          {/* Question Summary Checklist */}
          <div className="space-y-2.5">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                onClick={() => handleJumpToQuestion(idx)}
                className="p-3.5 rounded-2xl bg-[var(--card-bg)] border-2 border-[var(--card-border)] hover:border-[#FFB830]/50 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 truncate pr-2">
                  <span className="w-7 h-7 rounded-xl bg-[#FFB830]/20 text-[#E67700] font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-sm text-[var(--text-primary)] truncate">
                    {q.text || `Question ${idx + 1}`}
                  </span>
                </div>
                <Badge variant="mint" className="shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-[#36D399]" />
                  <span>Set</span>
                </Badge>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <Button
              type="button"
              variant="lemon"
              size="lg"
              fullWidth
              disabled={isSubmitting || isSuccessRedirecting}
              onClick={handlePublishQuiz}
            >
              {isSubmitting || isSuccessRedirecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#2D1B0E]" />
                  <span>Launching Your Quiz... ✨</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#2D1B0E]" />
                  <span>Launch My Quiz &amp; Get Share Link ✨</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => setStage("wizard")}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit Questions</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
