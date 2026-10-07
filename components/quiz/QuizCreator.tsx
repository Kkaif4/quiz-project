"use client";

import React, { useState, useEffect, useTransition } from "react";
import { SelectionBox } from "@/components/ui/SelectionBox";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { IconBox } from "@/components/ui/IconBox";
import type { QuizCreationResult } from "@/types/quiz";
import { getBrowserFingerprint } from "@/lib/fingerprint";
import { useRecaptchaV3 } from "@/hooks/useRecaptchaV3";

interface QuizCreatorProps {
  initialTemplateId?: string;
}

type WizardStage = "setup" | "wizard" | "review";

export function QuizCreator({ initialTemplateId }: QuizCreatorProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { executeRecaptcha } = useRecaptchaV3();

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
    setTitle(
      creatorName.trim()
        ? `How Well Do You Know ${creatorName.trim()}?`
        : "My Friendship Quiz",
    );
    setDescription("");
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
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
    setErrorMessage(null);
  };

  const handleAddQuestion = () => {
    if (questions.length >= 15) {
      setErrorMessage("Quizzes can have a maximum of 15 questions.");
      return;
    }
    const newQ = createEmptyQuestion(questions.length + 1);
    setQuestions((prev) => [...prev, newQ]);
    setCurrentQuestionIndex(questions.length);
    setErrorMessage(null);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 3) {
      setErrorMessage("Quizzes must have at least 3 questions.");
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (currentQuestionIndex >= questions.length - 1) {
      setCurrentQuestionIndex(Math.max(0, questions.length - 2));
    }
    setErrorMessage(null);
  };

  const validateSetup = (): string | null => {
    if (!creatorName.trim()) {
      return "Please enter your name so your friends know whose quiz they are taking.";
    }
    if (!title.trim()) {
      return "Quiz title cannot be empty.";
    }
    return null;
  };

  const validateCurrentQuestion = (): string | null => {
    const q = questions[currentQuestionIndex];
    if (!q) return null;
    if (!q.text.trim()) {
      return `Please enter a question prompt for Question ${currentQuestionIndex + 1}.`;
    }
    for (let i = 0; i < q.options.length; i++) {
      if (!q.options[i].text.trim()) {
        return `Please fill in Option ${i + 1} on Question ${currentQuestionIndex + 1}.`;
      }
    }
    if (!q.options.some((o) => o.id === q.correctOptionId)) {
      return `Please select the secret correct answer for Question ${currentQuestionIndex + 1}.`;
    }
    return null;
  };

  const validateAll = (): string | null => {
    const setupError = validateSetup();
    if (setupError) return setupError;

    if (questions.length < 3) {
      return "Your quiz must have at least 3 questions.";
    }
    if (questions.length > 15) {
      return "Your quiz cannot have more than 15 questions.";
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        return `Question ${i + 1} prompt cannot be empty.`;
      }
      if (q.options.length < 2) {
        return `Question ${i + 1} must have at least 2 options.`;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          return `Option ${j + 1} in Question ${i + 1} cannot be empty.`;
        }
      }
      if (!q.options.some((o) => o.id === q.correctOptionId)) {
        return `Please select a secret correct answer for Question ${i + 1}.`;
      }
    }

    return null;
  };

  const handleStartCustomizing = () => {
    const error = validateSetup();
    if (error) {
      setErrorMessage(error);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrorMessage(null);
    setStage("wizard");
    setCurrentQuestionIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextQuestion = () => {
    const error = validateCurrentQuestion();
    if (error) {
      setErrorMessage(error);
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
      // Invisible reCAPTCHA v3 verification (fails open safely if blocked or times out)
      const recaptchaToken = await executeRecaptcha("create_quiz");

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
        recaptchaToken: recaptchaToken || undefined,
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

      // TASK-1006: Bulletproof immediate hard navigation to owner dashboard
      setIsSuccessRedirecting(true);
      setCreatedManageUrl(result.manageUrl);

      if (typeof window !== "undefined") {
        window.location.assign(result.manageUrl);
      } else {
        startTransition(() => {
          router.push(result.manageUrl);
        });
      }
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

  if (isSuccessRedirecting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-primary)]/90 backdrop-blur-md animate-in fade-in duration-200">
        <div className="card-cozy rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-[var(--accent-plum)]/30">
          <div className="mx-auto flex items-center justify-center">
            <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center relative">
            <Image
              src="/Submitting Progress Indicator-2.webp"
              alt="Publishing quiz"
              width={96}
              height={96}
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain animate-pulse"
            />
          </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Quiz Created Successfully!
            </h2>
            <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              Redirecting you to your private Owner Dashboard &amp; live leaderboard...
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-[var(--accent-plum)] font-bold text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading Dashboard...</span>
          </div>

          {createdManageUrl && (
            <div className="pt-2">
              <a
                href={createdManageUrl}
                className="text-xs font-bold text-[var(--accent-plum)] hover:underline transition-colors"
              >
                Click here if you are not redirected automatically &rarr;
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

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
      {(() => {
       const stageIndex = stage === "setup" ? 0 : stage === "wizard" ? 1 : 2;
       return (
         <div className="mb-6 flex items-center justify-between p-2 rounded-2xl bg-[var(--accent-plum)]/5 border border-[var(--accent-plum)]/15">
           {/* Step 1: Setup */}
           <button
             type="button"
             onClick={() => {
               setErrorMessage(null);
               setStage("setup");
             }}
             className={cn(
               "flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98",
               stageIndex === 0
                 ? "bg-[var(--accent-plum)] text-white shadow-xs"
                 : stageIndex > 0
                   ? "bg-[var(--accent-sage)]/15 text-[var(--accent-sage)] border border-[var(--accent-sage)]/30 hover:bg-[var(--accent-sage)]/25"
                   : "text-[var(--text-muted)] opacity-60 hover:opacity-100",
             )}
           >
             {stageIndex > 0 ? (
               <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
             ) : (
               <Sliders className="w-3.5 h-3.5" />
             )}
             <span>1. Setup</span>
           </button>

           <div
             className={cn(
               "w-3 sm:w-4 h-0.5 mx-1 transition-colors",
               stageIndex > 0 ? "bg-[var(--accent-sage)]/50" : "bg-[var(--accent-plum)]/20",
             )}
           />

           {/* Step 2: Questions */}
           <button
             type="button"
             onClick={() => {
               setErrorMessage(null);
               setStage("wizard");
             }}
             className={cn(
               "flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98",
               stageIndex === 1
                 ? "bg-[var(--accent-plum)] text-white shadow-xs"
                 : stageIndex > 1
                   ? "bg-[var(--accent-sage)]/15 text-[var(--accent-sage)] border border-[var(--accent-sage)]/30 hover:bg-[var(--accent-sage)]/25"
                   : "text-[var(--text-muted)] opacity-60 hover:opacity-100",
             )}
           >
             {stageIndex > 1 ? (
               <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
             ) : (
               <Pencil className="w-3.5 h-3.5" />
             )}
             <span>2. Questions ({questions.length})</span>
           </button>

           <div
             className={cn(
               "w-3 sm:w-4 h-0.5 mx-1 transition-colors",
               stageIndex > 1 ? "bg-[var(--accent-sage)]/50" : "bg-[var(--accent-plum)]/20",
             )}
           />

           {/* Step 3: Review */}
           <button
             type="button"
             onClick={() => {
               setErrorMessage(null);
               setStage("review");
             }}
             className={cn(
               "flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98",
               stageIndex === 2
                 ? "bg-[var(--accent-plum)] text-white shadow-xs"
                 : "text-[var(--text-muted)] opacity-60 hover:opacity-100",
             )}
           >
             <Eye className="w-3.5 h-3.5" />
             <span>3. Review</span>
           </button>
         </div>
       );
     })()}

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-semibold">{errorMessage}</div>
        </div>
      )}

      {/* STAGE 1: SETUP STAGE */}
      {stage === "setup" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Creator Name & Identity Section */}
          <section className="card-cozy rounded-3xl p-5 sm:p-7">
            <div className="text-center mb-5">
              <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 mx-auto mb-2 flex items-center justify-center">
                <Image
                  src="/Cozy Lemon Reading Nook.webp"
                  alt="Cozy Lemon Reading Nook Mascot"
                  width={208}
                  height={208}
                  priority
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <IconBox size="sm" variant="plum"><UserIcon className="w-4 h-4" /></IconBox>
                <div>
                  <h2 className="text-xs font-bold text-[var(--accent-plum)] uppercase tracking-wider">
                    Step 1: Your Name
                  </h2>
                  <p className="text-[11px] text-[var(--text-muted)] font-medium">
                    Friends will see who created this quiz
                  </p>
                </div>
              </div>

              {isIdentifiedUser && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--accent-sage)]/15 border border-[var(--accent-sage)]/30 text-[var(--accent-sage)]">
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
                What is your name? <span className="text-rose-400">*</span>
              </label>
              <input
                id="creator-name-input"
                type="text"
                value={creatorName}
                onChange={(e) => handleCreatorNameChange(e.target.value)}
                placeholder="Please enter your name"
                maxLength={50}
                autoFocus
                className="w-full min-h-[56px] px-4 py-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-[var(--accent-plum)] focus:ring-2 focus:ring-[var(--accent-plum)]/20 text-[var(--text-primary)] font-black text-xl placeholder:text-[var(--text-muted)] outline-none transition-all"
              />
              <div className="flex justify-between items-center mt-1.5 px-1">
                <span className="text-[11px] text-[var(--text-muted)]">
                  Required to link your quiz to this browser
                </span>
                <span className="text-[11px] text-[var(--accent-plum)] font-bold">
                  {creatorName.length}/50
                </span>
              </div>
            </div>
          </section>

          {/* Template Selector Carousel */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-[var(--color-plum)] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-plum)] shrink-0" />
                <span>Pick a Starting Preset</span>
              </h2>
              <span className="text-xs text-[var(--text-muted)] font-medium">
                Instant questions loaded
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {TEMPLATES.map((tmpl) => {
                const isSelected = activeTemplateId === tmpl.id;
                return (
                  <SelectionBox
                    key={tmpl.id}
                    layout="vertical"
                    isSelected={isSelected}
                    indicatorType="radio"
                    badge={`${tmpl.questions.length}Q`}
                    icon={
                      tmpl.themeIcon ? (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-0.5 bg-[var(--surface)] border border-[var(--border-subtle)]">
                          <Image
                            src={tmpl.themeIcon}
                            alt={tmpl.title}
                            width={32}
                            height={32}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0",
                            tmpl.colorClass,
                          )}
                        >
                          {renderTemplateIcon(tmpl.iconName)}
                        </div>
                      )
                    }
                    title={tmpl.title}
                    description={tmpl.badge}
                    onClick={() => handleSelectTemplate(tmpl)}
                  />
                );
              })}

              {/* Blank Canvas Option */}
              <SelectionBox
                layout="vertical"
                isSelected={activeTemplateId === "blank"}
                indicatorType="radio"
                badge="Custom"
                icon={
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                }
                title="Blank Canvas"
                description="Start fresh"
                onClick={handleSelectBlank}
                className="col-span-2 sm:col-span-1"
              />
            </div>
          </section>

          {/* Quiz Details Card */}
          <section className="card-cozy rounded-3xl p-5 sm:p-7">
            <h2 className="text-xs font-bold text-[var(--accent-plum)] uppercase tracking-wider mb-4">
              Quiz Setup
            </h2>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="quiz-title-input"
                  className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider"
                >
                  Quiz Title <span className="text-rose-400">*</span>
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
                  className="w-full min-h-[56px] px-4 py-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-[var(--accent-plum)] focus:ring-2 focus:ring-[var(--accent-plum)]/20 text-[var(--text-primary)] font-bold text-lg placeholder:text-[var(--text-muted)] outline-none transition-all"
                />
                <div className="flex justify-between items-center mt-1.5 px-1">
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Friends see this on the invite and leaderboard
                  </span>
                  <span className="text-[11px] text-[var(--accent-plum)] font-bold">
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
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-[var(--accent-plum)] focus:ring-2 focus:ring-[var(--accent-plum)]/20 text-[var(--text-primary)] font-medium text-sm placeholder:text-[var(--text-muted)] outline-none resize-none transition-all"
                />
                <div className="flex justify-end mt-1 px-1">
                  <span className="text-[11px] text-[var(--accent-plum)] font-bold">
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
              className="btn-primary-cozy w-full min-h-[56px] flex items-center justify-center gap-2 text-base font-bold cursor-pointer"
            >
              <span>Start Customizing Questions ({questions.length})</span>
              <ArrowRight className="w-5 h-5 text-white/90" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: QUESTION WIZARD STAGE */}
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
                className="text-[var(--accent-plum)] hover:underline font-semibold cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Jump to Review</span>
              </button>
            </div>

            {/* Gradient Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[var(--accent-plum)]/15 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--accent-plum)] to-[var(--accent-rose)] transition-all duration-300 ease-out rounded-full"
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
                        ? "bg-[var(--accent-plum)] text-white shadow-xs"
                        : isComplete
                          ? "bg-[var(--accent-plum)]/15 text-[var(--accent-plum)] hover:bg-[var(--accent-plum)]/25"
                          : "bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]",
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
                  className="w-8 h-8 rounded-xl border border-dashed border-[var(--accent-plum)]/40 text-[var(--accent-plum)] hover:bg-[var(--accent-plum)]/10 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
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

          {/* Sticky Mobile Action Dock (UI-006: Prioritize Next, responsive buttons, 320px viability) */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--card-bg)]/95 backdrop-blur-md border-t border-[var(--card-border)] p-2.5 sm:p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
              {/* Previous Button: Compact on mobile, 56px touch target */}
              <Button
                variant="secondary"
                size="lg"
                onClick={handlePreviousQuestion}
                aria-label={currentQuestionIndex === 0 ? "Back to Setup" : "Previous Question"}
                leftIcon={<ArrowLeft className="w-4 h-4 shrink-0" />}
                className="shrink-0 px-3 sm:px-4"
              >
                <span className="hidden sm:inline">
                  {currentQuestionIndex === 0 ? "Setup" : "Previous"}
                </span>
              </Button>

              {/* Add Question Button: Compact button */}
              {questions.length < 15 && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleAddQuestion}
                  aria-label="Add Question"
                  leftIcon={<Plus className="w-4 h-4 shrink-0" />}
                  className="shrink-0 px-3 sm:px-3.5 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Add</span>
                </Button>
              )}

              {/* Next / Review Button: Dominant primary action */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleNextQuestion}
                rightIcon={
                  currentQuestionIndex + 1 < questions.length ? (
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  ) : (
                    <Eye className="w-4 h-4 shrink-0" />
                  )
                }
                className="flex-1 min-w-0"
              >
                <span>
                  {currentQuestionIndex + 1 < questions.length ? "Next" : "Review"}
                </span>
                <span className="hidden sm:inline">
                  {currentQuestionIndex + 1 < questions.length ? " Question" : " Quiz"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: REVIEW STAGE */}
      {stage === "review" && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
          {/* Header Summary */}
          <div className="card-cozy rounded-3xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--accent-plum)] uppercase tracking-wider">
                Quiz Overview
              </span>
              <button
                type="button"
                onClick={() => setStage("setup")}
                className="text-xs font-semibold text-[var(--accent-plum)] hover:underline cursor-pointer flex items-center gap-1"
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
              <span className="px-2.5 py-1 rounded-full bg-[var(--accent-plum)]/10 text-[var(--accent-plum)]">
                {questions.length} Questions
              </span>
              <span>Takes ~60 seconds to play</span>
            </div>
          </div>

          {/* List of Questions with Secret Answers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-[var(--accent-plum)] uppercase tracking-wider">
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
                  className="card-cozy rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3 hover:border-[var(--accent-plum)]/30 transition-all"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[var(--accent-plum)]/10 text-[var(--accent-plum)] text-xs font-extrabold flex items-center justify-center shrink-0">
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
                      <span className="inline-flex items-center gap-1 font-bold text-[var(--accent-sage)] bg-[var(--accent-sage)]/15 border border-[var(--accent-sage)]/30 px-2 py-0.5 rounded-lg truncate">
                        <CheckCircle2 className="w-3 h-3 text-[var(--accent-sage)] shrink-0" />
                        <span className="truncate">
                          {correctOpt?.text || "None selected"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJumpToQuestion(idx)}
                    className="min-h-[44px] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:scale-95 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Google reCAPTCHA v3 Disclosure */}
          <p className="text-[10px] text-[var(--text-muted)] text-center mt-3 mb-2">
            Protected by reCAPTCHA (
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-[var(--text-secondary)]"
            >
              Privacy
            </a>
            {" "}&middot;{" "}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-[var(--text-secondary)]"
            >
              Terms
            </a>
            )
          </p>

          {/* Sticky Mobile Review Action Dock (UI-007: Dominant Publish CTA, perfectly aligned) */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--card-bg)]/95 backdrop-blur-md border-t border-[var(--card-border)] p-2.5 sm:p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-2.5 sm:gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setCurrentQuestionIndex(questions.length - 1);
                  setStage("wizard");
                }}
                leftIcon={<ArrowLeft className="w-4 h-4 shrink-0" />}
                className="shrink-0 px-3.5 sm:px-5"
              >
                <span className="sm:hidden">Back</span>
                <span className="hidden sm:inline">Questions</span>
              </Button>

              <Button
                variant="premium"
                size="lg"
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                loadingText="Publishing Quiz..."
                leftIcon={
                  !isSubmitting ? (
                    <Sparkles className="w-5 h-5 text-[#8A5B17] shrink-0" />
                  ) : undefined
                }
                className="flex-1 min-w-0"
              >
                <span className="truncate">Publish Quiz Now</span>
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
