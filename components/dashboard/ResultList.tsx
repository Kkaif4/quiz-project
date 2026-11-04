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
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

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
      item.nickname.toLowerCase().includes(query)
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

  const renderScoreBadge = (pct: number) => {
    if (pct >= 90) return <Badge variant="lemon">🔮 {pct}%</Badge>;
    if (pct >= 70) return <Badge variant="mint">👑 {pct}%</Badge>;
    if (pct >= 40) return <Badge variant="violet">🤝 {pct}%</Badge>;
    return <Badge variant="slate">☕ {pct}%</Badge>;
  };

  return (
    <div className="w-full card-surface rounded-3xl p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFB830]/15 border-2 border-[#FFB830]/30 flex items-center justify-center text-xl shrink-0">
            📝
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#E67700] block">
              Answer Breakdown
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight">
              Detailed Friend Responses
            </h3>
          </div>
        </div>

        <Badge variant="lemon" tilt="right">
          <span>
            {history.length} {history.length === 1 ? "response" : "responses"}
          </span>
        </Badge>
      </div>

      {/* Search Input Filter */}
      {history.length > 0 && (
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by friend nickname..."
          icon={<Search className="w-4 h-4 text-[#FFB830]" />}
          addonRight={
            searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-black text-[#E67700] hover:underline cursor-pointer"
              >
                Clear
              </button>
            ) : null
          }
        />
      )}

      {/* History Items */}
      {filteredHistory.length === 0 ? (
        <div className="py-8 text-center rounded-2xl bg-[var(--card-bg)] border-2 border-[var(--card-border)] space-y-1">
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {searchQuery
              ? `No friend responses matching "${searchQuery}"`
              : "No detailed submissions recorded yet"}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {searchQuery
              ? "Try searching for a different nickname."
              : "Completed quizzes will list exact question answers here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const isExpanded = expandedCodes.has(item.code);

            return (
              <div
                key={item.code}
                className="rounded-2xl border-2 border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden shadow-tactile transition-all"
              >
                {/* Accordion Row Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.code)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-white/5 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#FFB830]/20 text-[#E67700] font-black text-xs flex items-center justify-center shrink-0">
                      {item.score}/{item.total}
                    </div>
                    <div className="min-w-0">
                      <span className="font-black text-sm sm:text-base text-[var(--text-primary)] truncate block">
                        {item.nickname}
                      </span>
                      <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs font-semibold mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {renderScoreBadge(item.percentage)}
                    <div className="text-[var(--text-muted)]">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Question-by-Question Breakdown */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t-2 border-[var(--border-subtle)] space-y-2.5 mt-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)] block pt-2">
                      Answer Choices vs Correct Answers
                    </span>

                    <div className="space-y-2">
                      {questions.map((q, idx) => {
                        const userAns = Array.isArray(item.answers)
                          ? item.answers.find((a) => a.questionId === q.id)
                          : undefined;
                        const submittedOptId = userAns?.optionId;
                        const isMatch = submittedOptId === q.correctOptionId;
                        const pickedOption = q.options.find(
                          (o) => o.id === submittedOptId
                        );
                        const correctOption = q.options.find(
                          (o) => o.id === q.correctOptionId
                        );

                        return (
                          <div
                            key={q.id}
                            className={`p-3 rounded-xl border-2 flex items-start justify-between gap-2.5 text-xs ${
                              isMatch
                                ? "bg-[#10B981]/10 border-[#10B981]/30"
                                : "bg-rose-500/10 border-rose-500/30"
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <p className="font-black text-[var(--text-primary)]">
                                {idx + 1}. {q.text}
                              </p>
                              <p className="text-[var(--text-secondary)] font-semibold">
                                Picked:{" "}
                                <span
                                  className={
                                    isMatch
                                      ? "text-emerald-400 font-bold"
                                      : "text-rose-400 font-bold"
                                  }
                                >
                                  {pickedOption?.text || "No Answer"}
                                </span>
                              </p>
                              {!isMatch && correctOption && (
                                <p className="text-[#E67700] font-bold">
                                  Your answer: {correctOption.text}
                                </p>
                              )}
                            </div>

                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                isMatch
                                  ? "bg-emerald-500 text-white"
                                  : "bg-rose-500 text-white"
                              }`}
                            >
                              {isMatch ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <X className="w-3.5 h-3.5 stroke-[3]" />
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
