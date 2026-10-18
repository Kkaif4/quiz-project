"use client";

import React from "react";
import { Trash2, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label, HelperText } from "@/components/ui/Typography";

export interface QuestionEditorData {
  id: string;
  text: string;
  type: "single";
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
}

export interface QuestionEditorProps {
  index: number;
  question: QuestionEditorData;
  totalQuestions: number;
  onUpdateQuestion: (updated: QuestionEditorData) => void;
  onDeleteQuestion?: () => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuestionEditor({
  index,
  question,
  totalQuestions,
  onUpdateQuestion,
  onDeleteQuestion,
}: QuestionEditorProps) {
  const canDeleteQuestion = totalQuestions > 3 && Boolean(onDeleteQuestion);
  const canAddOption = question.options.length < 6;
  const canRemoveOption = question.options.length > 2;

  const handleTextChange = (text: string) => {
    onUpdateQuestion({
      ...question,
      text: text.slice(0, 300),
    });
  };

  const handleOptionTextChange = (optId: string, text: string) => {
    const updatedOptions = question.options.map((opt) =>
      opt.id === optId ? { ...opt, text: text.slice(0, 100) } : opt,
    );
    onUpdateQuestion({
      ...question,
      options: updatedOptions,
    });
  };

  const handleSetCorrectOption = (optId: string) => {
    onUpdateQuestion({
      ...question,
      correctOptionId: optId,
    });
  };

  const handleAddOption = () => {
    if (!canAddOption) return;
    const newId = `opt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newOptions = [...question.options, { id: newId, text: "" }];
    onUpdateQuestion({
      ...question,
      options: newOptions,
    });
  };

  const handleRemoveOption = (optId: string) => {
    if (!canRemoveOption) return;
    const remaining = question.options.filter((opt) => opt.id !== optId);
    let newCorrect = question.correctOptionId;
    if (newCorrect === optId && remaining.length > 0) {
      newCorrect = remaining[0].id;
    }
    onUpdateQuestion({
      ...question,
      options: remaining,
      correctOptionId: newCorrect,
    });
  };

  return (
    <Card className="p-4 sm:p-7 transition-all">
      {/* Question Header */}
      <div className="flex items-center justify-between gap-2.5 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--color-plum)]/10 border border-[var(--color-plum)]/20 text-[var(--color-plum)] font-extrabold text-xs shrink-0">
            {index + 1}
          </span>
          <span className="text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase truncate">
            Question {index + 1} of {totalQuestions}
          </span>
        </div>

        {canDeleteQuestion ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDeleteQuestion}
            leftIcon={<Trash2 className="w-3.5 h-3.5 shrink-0" />}
            className="h-9 px-3 text-xs"
            title="Delete this question"
          >
            <span className="hidden sm:inline">Delete Question</span>
          </Button>
        ) : (
          <HelperText className="text-[11px] text-[var(--text-muted)] shrink-0">
            Min 3 questions
          </HelperText>
        )}
      </div>

      {/* Question Input */}
      <div className="mb-5">
        <Label
          htmlFor={`question-${question.id}-text`}
          className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2"
        >
          Prompt / Question Text
        </Label>
        <textarea
          id={`question-${question.id}-text`}
          rows={2}
          value={question.text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="e.g. What is my go-to comfort food on a Friday night?"
          maxLength={300}
          className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-[var(--color-plum)] focus:ring-2 focus:ring-[var(--color-plum)]/20 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-semibold text-base resize-none transition-all outline-none"
        />
        <div className="flex justify-end mt-1">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">
            {question.text.length} / 300
          </span>
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider px-1">
          <span>Options (2–6)</span>
          <span className="text-[var(--color-plum)]">Mark Secret Answer</span>
        </div>

        <div role="radiogroup" aria-label="Question options" className="space-y-2.5">
          {question.options.map((opt, optIndex) => {
            const isCorrect = opt.id === question.correctOptionId;
            const letter = OPTION_LETTERS[optIndex] || `${optIndex + 1}`;

            return (
              <div
                key={opt.id}
                className={cn(
                  "flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-2xl border transition-all min-h-[56px]",
                  isCorrect
                    ? "border-2 border-[var(--color-plum)] bg-[var(--color-plum)]/10 ring-2 ring-[var(--color-plum)]/20 shadow-xs"
                    : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--color-plum)]/30",
                )}
              >
                {/* Option Letter Badge */}
                <div
                  className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors",
                    isCorrect
                      ? "bg-[var(--color-plum)] text-white shadow-xs"
                      : "bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]",
                  )}
                  aria-hidden="true"
                >
                  {letter}
                </div>

                {/* Option Text Input */}
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                  placeholder={`Option ${letter}...`}
                  maxLength={100}
                  className="flex-1 min-w-0 bg-transparent text-sm sm:text-base font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none px-1.5 py-1"
                />

                {/* Mark as Correct Secret Answer Button */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={isCorrect}
                  onClick={() => handleSetCorrectOption(opt.id)}
                  aria-label={`Mark Option ${letter} as secret correct answer`}
                  className={cn(
                    "w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer outline-none",
                    "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]",
                    isCorrect
                      ? "bg-[var(--accent-sage)] text-white shadow-xs"
                      : "border-2 border-[var(--input-border)] hover:border-[var(--color-plum)]/50 text-transparent",
                  )}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>

                {/* Remove Option Button */}
                {canRemoveOption && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(opt.id)}
                    aria-label={`Remove Option ${letter}`}
                    className="w-9 h-9 min-h-[36px] min-w-[36px] rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Option Trigger */}
      {canAddOption && (
        <div className="mt-3.5 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleAddOption}
            leftIcon={<Plus className="w-3.5 h-3.5 shrink-0" />}
            className="text-xs font-semibold"
          >
            <span>Add Option ({question.options.length}/6)</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
