"use client";

import React from "react";
import { Trash2, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="card-surface rounded-3xl p-5 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all">
      {/* Question Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 font-extrabold text-xs">
            {index + 1}
          </span>
          <span className="text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
            Question {index + 1} of {totalQuestions}
          </span>
        </div>

        {canDeleteQuestion ? (
          <button
            type="button"
            onClick={onDeleteQuestion}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 rounded-xl transition-all cursor-pointer active:scale-95"
            title="Delete this question"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete Question</span>
          </button>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">Min 3 questions</span>
        )}
      </div>

      {/* Question Input */}
      <div className="mb-5">
        <label
          htmlFor={`question-${question.id}-text`}
          className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2"
        >
          Prompt / Question Text
        </label>
        <textarea
          id={`question-${question.id}-text`}
          rows={2}
          value={question.text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="e.g. What is my go-to comfort food on a Friday night?"
          maxLength={300}
          className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-semibold text-base resize-none transition-all outline-none"
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
          <span className="text-violet-400">Mark Correct Secret Answer</span>
        </div>

        {question.options.map((opt, optIndex) => {
          const isCorrect = opt.id === question.correctOptionId;
          const letter = OPTION_LETTERS[optIndex] || `${optIndex + 1}`;

          return (
            <div
              key={opt.id}
              className={cn(
                "flex items-center gap-2.5 p-2 rounded-2xl border transition-all min-h-[56px]",
                isCorrect
                  ? "border-violet-500/70 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.18)]"
                  : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-violet-500/40",
              )}
            >
              {/* Option Letter Badge (Brand Pill) */}
              <div
                className={cn(
                  "w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors",
                  isCorrect
                    ? "bg-violet-600 text-white shadow-xs shadow-violet-600/30"
                    : "bg-violet-500/15 border border-violet-500/20 text-violet-300",
                )}
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
                className="flex-1 min-w-0 bg-transparent text-sm sm:text-base font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none px-2 py-1.5"
              />

              {/* Mark as Correct Button (Radio behavior with Purple Glow) */}
              <button
                type="button"
                onClick={() => handleSetCorrectOption(opt.id)}
                aria-label={`Mark Option ${letter} as correct`}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer",
                  isCorrect
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 ring-2 ring-violet-400/50"
                    : "border-2 border-[var(--input-border)] hover:border-violet-500/60 text-transparent",
                )}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>

              {/* Remove Option Button */}
              {canRemoveOption && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(opt.id)}
                  aria-label={`Remove Option ${letter}`}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/15 transition-colors shrink-0 cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Option Trigger */}
      {canAddOption && (
        <div className="mt-3.5 pt-2">
          <button
            type="button"
            onClick={handleAddOption}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-violet-300 hover:text-violet-200 bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/25 transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Option ({question.options.length}/6)</span>
          </button>
        </div>
      )}
    </div>
  );
}
