"use client";

import React from "react";
import { Trash2, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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
      opt.id === optId ? { ...opt, text: text.slice(0, 100) } : opt
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
    <div className="card-surface rounded-3xl p-5 sm:p-7 space-y-5">
      {/* Question Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#FFB830] text-[#2D1B0E] font-black text-sm shadow-[0_2px_0_#E09800]">
            {index + 1}
          </span>
          <span className="text-xs font-black tracking-wider text-[var(--text-muted)] uppercase">
            Question {index + 1} of {totalQuestions}
          </span>
        </div>

        {canDeleteQuestion ? (
          <button
            type="button"
            onClick={onDeleteQuestion}
            className="text-[var(--text-muted)] hover:text-rose-400 p-1.5 rounded-xl hover:bg-rose-500/10 active:scale-95 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        ) : (
          <Badge variant="slate">Min 3 questions</Badge>
        )}
      </div>

      {/* Question Text Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
          Question Text
        </label>
        <textarea
          value={question.text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="e.g. What is my biggest guilty pleasure snack?"
          rows={2}
          className="w-full p-4 rounded-2xl bg-[var(--input-bg)] border-2 border-[var(--input-border)] focus:border-[#FFB830] focus:ring-4 focus:ring-[#FFB830]/20 text-[var(--text-primary)] font-bold text-base placeholder:text-[var(--text-muted)] outline-none transition-all resize-none"
        />
      </div>

      {/* Options Configuration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
            Answer Choices (Tap checkmark to set correct answer)
          </label>
          <span className="text-[11px] font-bold text-[#E67700]">
            🔒 Kept secret until friend submits
          </span>
        </div>

        <div className="space-y-2.5">
          {question.options.map((opt, optIdx) => {
            const isCorrect = question.correctOptionId === opt.id;
            const letter = OPTION_LETTERS[optIdx] || `${optIdx + 1}`;

            return (
              <div
                key={opt.id}
                className={cn(
                  "p-2 sm:p-3 rounded-2xl border-2 transition-all flex items-center gap-1.5 sm:gap-2.5",
                  isCorrect
                    ? "border-[#FFB830] bg-[#FFB830]/10 shadow-[0_2px_0_#E09800]"
                    : "border-[var(--card-border)] bg-[var(--card-bg)]"
                )}
              >
                {/* Letter Indicator */}
                <span
                  className={cn(
                    "w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0",
                    isCorrect
                      ? "bg-[#FFB830] text-[#2D1B0E]"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--card-border)]"
                  )}
                >
                  {letter}
                </span>

                {/* Option Text Input */}
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                  placeholder={`Option ${letter} text...`}
                  className="flex-1 min-w-0 bg-transparent text-[var(--text-primary)] font-bold text-sm sm:text-base placeholder:text-[var(--text-muted)] outline-none"
                />

                {/* Mark as Correct Answer Button */}
                <button
                  type="button"
                  onClick={() => handleSetCorrectOption(opt.id)}
                  title={isCorrect ? "Correct Answer" : "Set as Correct"}
                  className={cn(
                    "px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all select-none shrink-0",
                    isCorrect
                      ? "bg-[#36D399] text-white shadow-xs"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--card-border)]"
                  )}
                >
                  <Check
                    className={cn(
                      "w-4 h-4 sm:w-3.5 sm:h-3.5 stroke-[3]",
                      isCorrect ? "text-white" : "text-[var(--text-muted)]"
                    )}
                  />
                  <span className="hidden sm:inline">{isCorrect ? "Correct Answer" : "Set Correct"}</span>
                </button>

                {/* Delete Option */}
                {canRemoveOption && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(opt.id)}
                    className="p-2 text-[var(--text-muted)] hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Option Button */}
        {canAddOption && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddOption}
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 text-[#FFB830]" />
            <span>Add Option ({question.options.length}/6)</span>
          </Button>
        )}
      </div>
    </div>
  );
}
