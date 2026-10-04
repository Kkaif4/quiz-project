"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  HeartHandshake,
  Flame,
  Compass,
  Plus,
  Loader2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Pencil,
  Eye,
  Sliders,
  User as UserIcon,
} from "lucide-react";
import { TEMPLATES, getTemplateById, type QuizTemplate } from "@/lib/templates";
import { QuestionEditor, type QuestionEditorData } from "./QuestionEditor";
import { cn } from "@/lib/utils";
import type { QuizCreationResult } from "@/types/quiz";
import { getBrowserFingerprint } from "@/lib/fingerprint";

interface QuizCreatorProps {
  initialTemplateId?: string;
}

type WizardStage = "setup" | "wizard" | "review";

export function QuizCreator({ initialTemplateId }: QuizCreatorProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Load initial template or default to "best-friends"
  const defaultTemplate =
    (initialTemplateId && getTemplateById(initialTemplateId)) || TEMPLATES[0];

  // Creator identity & browser footprint state
  const [creatorName, setCreatorName] = useState<string>("");
  const [clientFingerprint, setClientFingerprint] = useState<string>("");
  const [isIdentifiedUser, setIsIdentifiedUser] = useState<boolean>(false);
  const [hasCustomizedTitle, setHasCustomizedTitle] = useState<boolean>(false);

  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    defaultTemplate ? defaultTemplate.id : "best-friends",
  );
  const [title, setTitle] = useState<string>(
    defaultTemplate ? defaultTemplate.title : "How Well Do You Know Me?",
  );
  const [description, setDescription] = useState<string>(
    defaultTemplate ? defaultTemplate.description : "",
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
        ],
  );

  // 3-Stage Wizard State
  const [stage, setStage] = useState<WizardStage>("setup");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const [honeypot, setHoneypot] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  // Detect browser blueprint and pre-fill recognized creator name
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
                : prev,
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
      })),
    );
    setErrorMessage(null);
  };

  const handleSelectBlank = () => {
    setActiveTemplateId("blank");
    setTitle("How Well Do You Know Me?");
    setDescription("Answer these questions to see how well you know me!");
    setQuestions([
      createEmptyQuestion(1),
      createEmptyQuestion(2),
      createEmptyQuestion(3),
    ]);
    setErrorMessage(null);
  };

  const handleUpdateQuestion = (
    index: number,
    updated: QuestionEditorData,
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

  // Validation
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
      return "Please enter your name before publishing your quiz.";
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

  // Stage Transitions
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
      // Completed last question, go to review
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
      // Back to setup
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validationError = validateAll();
    if (validationError) {
      setErrorMessage(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        creatorName: creatorName.trim(),
        clientFingerprint: clientFingerprint || undefined,
        title: title.trim(),
        description: description.trim(),
        questions: questions.map((q) => ({
          id: q.id,
          text: q.text.trim(),
          type: "single" as const,
          options: q.options.map((opt) => ({
            id: opt.id,
            text: opt.text.trim(),
          })),
          correctOptionId: q.correctOptionId,
        })),
        settings: {
          showScore: true,
          showCorrectAnswers: false,
          maxAttemptsPerPerson: 1,
        },
        website: honeypot, // Honeypot anti-bot
      };

      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create quiz. Please try again.");
      }

      const result: QuizCreationResult = data.data;

      // Rule 2.2: Backup raw ownerToken to client localStorage
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const raw = localStorage.getItem("quiz_owner_tokens");
          const existing: string[] = raw ? JSON.parse(raw) : [];
          if (!existing.includes(result.ownerToken)) {
            existing.unshift(result.ownerToken);
            localStorage.setItem(
              "quiz_owner_tokens",
              JSON.stringify(existing.slice(0, 50)),
            );
          }
        }
      } catch (storageErr) {
        console.warn("Could not save token to localStorage:", storageErr);
      }

      // Smooth transition to management dashboard
      startTransition(() => {
        router.push(result.manageUrl);
      });
    } catch (err: unknown) {
      console.error("Submission error:", err);
      const errorMsg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setErrorMessage(errorMsg);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderTemplateIcon = (iconName: QuizTemplate["iconName"]) => {
    switch (iconName) {
      case "HeartHandshake":
        return <HeartHandshake className="w-4 h-4" />;
      case "Flame":
        return <Flame className="w-4 h-4" />;
      case "Sparkles":
        return <Sparkles className="w-4 h-4" />;
      case "Compass":
        return <Compass className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full pb-36">
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

      {/* Top Wizard Steps Bar */}
      <div className="mb-6 flex items-center justify-between p-2 rounded-2xl bg-violet-500/10 border border-violet-500/20">
        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setStage("setup");
          }}
          className={cn(
            "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98",
            stage === "setup"
              ? "bg-violet-600 text-white shadow-xs shadow-violet-600/30"
              : "text-violet-300 hover:text-violet-100",
          )}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>1. Setup</span>
        </button>

        <div className="w-4 h-px bg-violet-500/30 mx-1" />

        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setStage("wizard");
          }}
          className={cn(
            "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98",
            stage === "wizard"
              ? "bg-violet-600 text-white shadow-xs shadow-violet-600/30"
              : "text-violet-300 hover:text-violet-100",
          )}
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>2. Questions ({questions.length})</span>
        </button>

        <div className="w-4 h-px bg-violet-500/30 mx-1" />

        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setStage("review");
          }}
          className={cn(
            "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98",
            stage === "review"
              ? "bg-violet-600 text-white shadow-xs shadow-violet-600/30"
              : "text-violet-300 hover:text-violet-100",
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>3. Review</span>
        </button>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-semibold">{errorMessage}</div>
        </div>
      )}

      {/* =====================================================================
          STAGE 1: SETUP STAGE
          ===================================================================== */}
      {stage === "setup" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Creator Name & Identity Section */}
          <section className="card-surface rounded-3xl p-5 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-violet-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/35 flex items-center justify-center text-violet-300 shadow-xs">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                    Step 1: Your Name
                  </h2>
                  <p className="text-[11px] text-[var(--text-muted)] font-medium">
                    Friends will see who created this quiz
                  </p>
                </div>
              </div>

              {isIdentifiedUser && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Recognized Device</span>
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="creator-name-input"
                className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider"
              >
                What is your name? <span className="text-pink-400">*</span>
              </label>
              <input
                id="creator-name-input"
                type="text"
                value={creatorName}
                onChange={(e) => handleCreatorNameChange(e.target.value)}
                placeholder="Please enter you precious Name"
                maxLength={50}
                autoFocus
                className="w-full min-h-[56px] px-4 py-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 text-[var(--text-primary)] font-black text-xl placeholder:text-[var(--text-muted)] outline-none transition-all"
              />
              <div className="flex justify-between items-center mt-1.5 px-1">
                <span className="text-[11px] text-[var(--text-muted)]">
                  Required to link your quiz to this browser
                </span>
                <span className="text-[11px] text-violet-400 font-bold">
                  {creatorName.length}/50
                </span>
              </div>
            </div>
          </section>

          {/* Template Selector Carousel */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                Pick a Starting Preset
              </h2>
              <span className="text-xs text-[var(--text-muted)] font-medium">
                Instant questions loaded
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {TEMPLATES.map((tmpl) => {
                const isSelected = activeTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={cn(
                      "p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between h-32 active:scale-98",
                      isSelected
                        ? "border-violet-500 bg-violet-500/20 ring-2 ring-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                        : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-violet-500/40",
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center",
                          tmpl.colorClass,
                        )}
                      >
                        {renderTemplateIcon(tmpl.iconName)}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                        {tmpl.questions.length}Q
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {tmpl.title}
                      </div>
                      <div className="text-[10px] font-medium text-[var(--text-muted)] truncate">
                        {tmpl.badge}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Blank Canvas option */}
              <button
                type="button"
                onClick={handleSelectBlank}
                className={cn(
                  "p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between h-32 active:scale-98",
                  activeTemplateId === "blank"
                    ? "border-violet-500 bg-violet-500/20 ring-2 ring-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                    : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-violet-500/40",
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-violet-500/15 border border-violet-500/30 text-violet-300">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                    Custom
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">
                    Blank Canvas
                  </div>
                  <div className="text-[10px] font-medium text-[var(--text-muted)]">
                    Start from scratch
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* Quiz Details Card */}
          <section className="card-surface rounded-3xl p-5 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <h2 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-4">
              Quiz Setup
            </h2>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="quiz-title-input"
                  className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider"
                >
                  Quiz Title <span className="text-pink-400">*</span>
                </label>
                <input
                  id="quiz-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value.slice(0, 100));
                    setHasCustomizedTitle(true);
                  }}
                  placeholder="e.g. How Well Do You Know Sarah?"
                  maxLength={100}
                  className="w-full min-h-[56px] px-4 py-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 text-[var(--text-primary)] font-bold text-lg placeholder:text-[var(--text-muted)] outline-none transition-all"
                />
                <div className="flex justify-between items-center mt-1.5 px-1">
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Friends see this on the invite and leaderboard
                  </span>
                  <span className="text-[11px] text-violet-400 font-bold">
                    {title.length}/100
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="quiz-description-input"
                  className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider"
                >
                  Description / Invitation Note (Optional)
                </label>
                <textarea
                  id="quiz-description-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                  placeholder="e.g. Take this quick test to see if you are a true best friend or an imposter!"
                  maxLength={300}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 text-[var(--text-primary)] font-medium text-sm placeholder:text-[var(--text-muted)] outline-none resize-none transition-all"
                />
                <div className="flex justify-end mt-1 px-1">
                  <span className="text-[11px] text-violet-400 font-bold">
                    {description.length}/300
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Setup Action: Start Customizing Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartCustomizing}
              className="w-full min-h-[56px] py-4 px-8 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-base shadow-lg shadow-violet-600/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer glow-purple"
            >
              <span>Start Customizing Questions ({questions.length})</span>
              <ArrowRight className="w-5 h-5 text-white/90" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STAGE 2: QUESTION WIZARD STAGE (ONE QUESTION AT A TIME)
          ===================================================================== */}
      {stage === "wizard" && questions[currentQuestionIndex] && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] px-1">
              <span className="uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <button
                type="button"
                onClick={() => setStage("review")}
                className="text-violet-400 hover:text-violet-300 font-semibold cursor-pointer underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Jump to Review</span>
              </button>
            </div>

            {/* Gradient Progress Bar */}
            <div className="w-full h-2 rounded-full bg-violet-500/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300 ease-out rounded-full"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Quick Question Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
              {questions.map((q, idx) => {
                const isActive = idx === currentQuestionIndex;
                const hasCorrect = q.options.some((o) => o.id === q.correctOptionId);
                const isComplete = q.text.trim().length > 0 && hasCorrect;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setCurrentQuestionIndex(idx);
                    }}
                    className={cn(
                      "w-8 h-8 rounded-xl font-extrabold text-xs shrink-0 flex items-center justify-center transition-all cursor-pointer active:scale-95",
                      isActive
                        ? "bg-violet-600 text-white ring-2 ring-violet-400 shadow-xs shadow-violet-600/30"
                        : isComplete
                          ? "bg-violet-500/20 text-violet-300 hover:bg-violet-500/30"
                          : "bg-slate-500/20 text-[var(--text-muted)] hover:bg-slate-500/30",
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}

              {questions.length < 15 && (
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  title="Add Question"
                  className="w-8 h-8 rounded-xl border border-dashed border-violet-500/40 text-violet-400 hover:bg-violet-500/20 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active Single Question Editor */}
          <QuestionEditor
            index={currentQuestionIndex}
            question={questions[currentQuestionIndex]}
            totalQuestions={questions.length}
            onUpdateQuestion={(updated) =>
              handleUpdateQuestion(currentQuestionIndex, updated)
            }
            onDeleteQuestion={
              questions.length > 3
                ? () => handleDeleteQuestion(currentQuestionIndex)
                : undefined
            }
          />

          {/* Sticky Mobile Action Dock */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--card-bg)]/95 backdrop-blur-md border-t border-[var(--card-border)] p-3 sm:p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.25)]">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
              {/* Previous Button */}
              <button
                type="button"
                onClick={handlePreviousQuestion}
                className="min-h-[56px] px-5 rounded-2xl border border-[var(--card-border)] bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 active:scale-[0.98] transition-all font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden xs:inline">
                  {currentQuestionIndex === 0 ? "Setup" : "Previous"}
                </span>
              </button>

              {/* Add Question Button in Dock */}
              {questions.length < 15 && (
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="min-h-[56px] px-4 rounded-2xl border border-dashed border-violet-500/40 text-violet-300 hover:bg-violet-500/15 active:scale-[0.98] transition-all font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Q</span>
                </button>
              )}

              {/* Next / Review Button */}
              <button
                type="button"
                onClick={handleNextQuestion}
                className="flex-1 min-h-[56px] px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-sm sm:text-base shadow-lg shadow-violet-600/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer glow-purple"
              >
                {currentQuestionIndex + 1 < questions.length ? (
                  <>
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Review Quiz</span>
                    <Eye className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STAGE 3: REVIEW STAGE (SUMMARY OF QUESTIONS & PUBLISH CTA)
          ===================================================================== */}
      {stage === "review" && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
          {/* Header Summary */}
          <div className="card-surface rounded-3xl p-5 sm:p-6 space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                Quiz Overview
              </span>
              <button
                type="button"
                onClick={() => setStage("setup")}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 underline cursor-pointer flex items-center gap-1"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit Title</span>
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {title}
            </h2>

            {description && (
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                {description}
              </p>
            )}

            <div className="pt-2 flex items-center gap-3 text-xs font-bold text-[var(--text-muted)]">
              <span className="px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300">
                {questions.length} Questions
              </span>
              <span>Takes ~60 seconds to play</span>
            </div>
          </div>

          {/* List of Questions with Secret Answers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                Questions &amp; Secret Answers
              </h3>
              <span className="text-xs text-[var(--text-muted)]">
                Tap Edit to change any question
              </span>
            </div>

            {questions.map((q, idx) => {
              const correctOpt = q.options.find((o) => o.id === q.correctOptionId);

              return (
                <div
                  key={q.id}
                  className="card-surface rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3 shadow-xs hover:border-violet-500/40 transition-all"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-300 text-xs font-extrabold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate">
                        {q.text || "(Untitled question)"}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs pl-8">
                      <span className="text-[var(--text-muted)] font-medium">
                        Secret Answer:
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-lg truncate">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">
                          {correctOpt?.text || "None selected"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJumpToQuestion(idx)}
                    className="min-h-[44px] px-3 py-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 active:scale-95 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Sticky Mobile Review Action Dock */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--card-bg)]/95 backdrop-blur-md border-t border-[var(--card-border)] p-3 sm:p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.25)]">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentQuestionIndex(questions.length - 1);
                  setStage("wizard");
                }}
                className="min-h-[56px] px-5 rounded-2xl border border-[var(--card-border)] bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 active:scale-[0.98] transition-all font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Questions</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 min-h-[56px] px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-black text-base shadow-xl shadow-violet-600/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer glow-purple-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Publishing Quiz...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-white" />
                    <span>Publish Quiz Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
