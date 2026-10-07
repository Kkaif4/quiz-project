"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  FileSpreadsheet,
  Clock,
} from "lucide-react";
import type { IOwnerAttemptHistory, IQuizQuestion } from "@/types/quiz";
import { formatRelativeTime } from "@/lib/utils";

export interface ResultListProps {
  history: IOwnerAttemptHistory[];
  questions: IQuizQuestion[];
}

export function ResultList({ history, questions }: ResultListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const query = searchQuery.trim().toLowerCase();
    return history.filter((item) =>
      item.nickname.toLowerCase().includes(query),
    );
  }, [history, searchQuery]);

  const toggleExpand = (code: string) => {
    setExpandedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const getPercentagePillClass = (pct: number) => {
    if (pct >= 90) return "bg-[var(--accent-sage)]/15 border-[var(--accent-sage)]/35 text-[var(--accent-sage)]";
    if (pct >= 70) return "bg-[var(--accent-rose)]/15 border-[var(--accent-rose)]/35 text-[var(--accent-rose)]";
    if (pct >= 40) return "bg-[var(--accent-lavender)]/20 border-[var(--accent-lavender)]/35 text-[var(--accent-plum)]";
    return "bg-[var(--surface)] border-[var(--border-subtle)] text-[var(--text-muted)]";
  };

  return (
    <div className="w-full card-cozy rounded-3xl p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-plum)]/10 border border-[var(--accent-plum)]/20 flex items-center justify-center text-[var(--accent-plum)] shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--accent-plum)] block">
              Answer Breakdown
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight">
              Detailed Friend Responses
            </h3>
          </div>
        </div>

        <span className="text-xs font-bold text-[var(--accent-plum)] self-start sm:self-auto px-3 py-1 rounded-full bg-[var(--accent-plum)]/10 border border-[var(--accent-plum)]/20">
          {history.length} {history.length === 1 ? "submission" : "submissions"}
        </span>
      </div>

      {/* Search Input Filter */}
      {history.length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--accent-plum)]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by friend nickname..."
            className="w-full min-h-[52px] pl-11 pr-16 py-2.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-plum)]/20 focus:border-[var(--accent-plum)] text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--accent-plum)] hover:underline text-xs font-bold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* History Items */}
      {history.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-2xl bg-[var(--accent-plum)]/5 border border-[var(--accent-plum)]/15">
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            No submissions recorded yet. Once friends complete the quiz, their detailed answers will appear here.
          </p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-2xl bg-[var(--accent-plum)]/5 border border-[var(--accent-plum)]/15">
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            No friend matches &ldquo;{searchQuery}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((attempt) => {
            const isExpanded = expandedCodes.has(attempt.code);

            return (
              <div
                key={attempt.code}
                className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] transition-all overflow-hidden shadow-xs"
              >
                {/* Expandable Row Trigger (56px min touch target) */}
                <button
                  type="button"
                  onClick={() => toggleExpand(attempt.code)}
                  className="w-full min-h-[56px] p-4 text-left flex items-center justify-between gap-3 hover:bg-[var(--accent-plum)]/5 active:scale-[0.99] transition-all cursor-pointer"
                >
                  {/* Left: Nickname & Time */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[var(--text-primary)] text-sm sm:text-base truncate block">
                        {attempt.nickname}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs font-medium mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(attempt.createdAt)}</span>
                    </div>
                  </div>

                  {/* Right: Score + Percentage + Expand Icon */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                        {attempt.score}
                      </span>
                      <span className="text-xs font-bold text-[var(--text-muted)]">
                        /{attempt.total}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-black border ${getPercentagePillClass(
                        attempt.percentage,
                      )}`}
                    >
                      {attempt.percentage}%
                    </span>

                    <div className="w-8 h-8 rounded-xl bg-[var(--surface)] text-[var(--text-secondary)] flex items-center justify-center border border-[var(--border-subtle)]">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Answer Key Comparison */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-[var(--border-subtle)] bg-[var(--accent-plum)]/5 space-y-3 animate-in fade-in duration-150">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent-plum)] mb-1">
                      Question by Question Comparison
                    </div>

                    <div className="space-y-2.5">
                      {questions.map((question, qIdx) => {
                        const answer = attempt.answers.find(
                          (a) => a.questionId === question.id,
                        );
                        const isCorrect =
                          answer?.optionId === question.correctOptionId;

                        const chosenOption = question.options.find(
                          (o) => o.id === answer?.optionId,
                        );
                        const correctOption = question.options.find(
                          (o) => o.id === question.correctOptionId,
                        );

                        return (
                          <div
                            key={question.id}
                            className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
                              isCorrect
                                ? "bg-[var(--accent-sage)]/10 border-[var(--accent-sage)]/30"
                                : "bg-rose-500/10 border-rose-500/30"
                            }`}
                          >
                            {/* Question Title */}
                            <div className="flex items-start gap-2.5 mb-2">
                              <span
                                className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-black ${
                                  isCorrect
                                    ? "bg-[var(--accent-sage)]/20 text-[var(--accent-sage)]"
                                    : "bg-rose-500/20 text-rose-500"
                                }`}
                              >
                                {isCorrect ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <X className="w-3.5 h-3.5" />
                                )}
                              </span>
                              <div className="flex-1">
                                <span className="font-bold text-[var(--text-primary)] block">
                                  {qIdx + 1}. {question.text}
                                </span>
                              </div>
                            </div>

                            {/* Answers Breakdown */}
                            <div className="pl-7 space-y-1 text-xs">
                              {isCorrect ? (
                                <div className="text-[var(--accent-sage)] font-semibold flex items-center gap-1.5">
                                  <span className="font-bold">
                                    Guessed correctly:
                                  </span>
                                  <span>{chosenOption?.text || "Unknown"}</span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="text-rose-500 font-medium flex items-center gap-1.5">
                                    <span className="font-bold">Guessed:</span>
                                    <span>
                                      {chosenOption?.text || "(No answer)"}
                                    </span>
                                  </div>
                                  <div className="text-[var(--accent-sage)] font-semibold flex items-center gap-1.5">
                                    <span className="font-bold">
                                      Your answer:
                                    </span>
                                    <span>
                                      {correctOption?.text || "Unknown"}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
