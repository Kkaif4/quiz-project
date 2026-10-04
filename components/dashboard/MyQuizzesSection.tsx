"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Users,
  Eye,
  ChevronRight,
  Share2,
  Check,
  KeyRound,
  User as UserIcon,
} from "lucide-react";
import type { IUserQuizSummary } from "@/types/quiz";
import { formatRelativeTime } from "@/lib/utils";
import { getBrowserFingerprint } from "@/lib/fingerprint";

export interface MyQuizzesSectionProps {
  serverQuizzes: IUserQuizSummary[];
}

export function MyQuizzesSection({ serverQuizzes }: MyQuizzesSectionProps) {
  const [quizzes, setQuizzes] = useState<IUserQuizSummary[]>(serverQuizzes);
  const [userName, setUserName] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sync client-side localStorage tokens and browser blueprint with server
  useEffect(() => {
    let isMounted = true;

    async function syncQuizzesAndFootprint() {
      try {
        if (typeof window === "undefined") return;

        // 1. Sync via Browser Blueprint (device identity recovery)
        const fp = await getBrowserFingerprint();
        if (fp && isMounted) {
          fetch("/api/users/identify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientFingerprint: fp }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (!isMounted) return;
              if (data.success && data.data?.user?.name) {
                setUserName(data.data.user.name);
              }
              if (
                data.success &&
                Array.isArray(data.data?.quizzes) &&
                data.data.quizzes.length > 0
              ) {
                setQuizzes((prev) => {
                  const quizMap = new Map<string, IUserQuizSummary>();
                  for (const q of prev) {
                    quizMap.set(q.code, q);
                  }
                  for (const q of data.data.quizzes) {
                    if (!quizMap.has(q.code)) {
                      quizMap.set(q.code, q);
                    }
                  }
                  return Array.from(quizMap.values()).sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  );
                });
              }
            })
            .catch((err) => {
              console.warn("Footprint sync error:", err);
            });
        }

        // 2. Sync client-side localStorage tokens with server
        if (!window.localStorage) return;

        const raw = localStorage.getItem("quiz_owner_tokens");
        const localTokens: string[] = raw ? JSON.parse(raw) : [];

        if (!Array.isArray(localTokens) || localTokens.length === 0) {
          // If localStorage is empty but server has quizzes, backfill localStorage
          if (serverQuizzes.length > 0) {
            const serverTokens = serverQuizzes
              .map((q) => q.ownerToken)
              .filter((t): t is string => typeof t === "string" && t.length > 0);
            localStorage.setItem(
              "quiz_owner_tokens",
              JSON.stringify(serverTokens),
            );
          }
          return;
        }

        // Check if localStorage contains tokens unknown to the server-rendered list
        const knownTokens = new Set(
          quizzes.map((q) => q.ownerToken).filter(Boolean),
        );
        const missingTokens = localTokens.filter((token) => !knownTokens.has(token));

        if (missingTokens.length > 0) {
          // Fetch missing quizzes from multi-quiz hub endpoint
          fetch("/api/quizzes/my-quizzes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tokens: localTokens }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (!isMounted) return;
              if (data.success && Array.isArray(data.data)) {
                const fetchedQuizzes: IUserQuizSummary[] = data.data;
                // Deduplicate and merge by quiz code
                setQuizzes((prev) => {
                  const quizMap = new Map<string, IUserQuizSummary>();
                  for (const q of prev) {
                    quizMap.set(q.code, q);
                  }
                  for (const q of fetchedQuizzes) {
                    quizMap.set(q.code, q);
                  }
                  return Array.from(quizMap.values()).sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  );
                });
              }
            })
            .catch((err) => {
              console.error("Failed to sync client owner quizzes:", err);
            });
        }
      } catch (err) {
        console.warn("Error accessing localStorage in MyQuizzesSection:", err);
      }
    }

    syncQuizzesAndFootprint();

    return () => {
      isMounted = false;
    };
  }, [serverQuizzes]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyLink = async (code: string) => {
    try {
      if (typeof window !== "undefined") {
        const url = `${window.location.origin}/q/${code}`;
        await navigator.clipboard.writeText(url);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
      }
    } catch (err) {
      console.error("Failed to copy quiz URL:", err);
    }
  };

  if (quizzes.length === 0) {
    return null;
  }

  return (
    <section className="w-full space-y-4 pt-2 sm:pt-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-xs">
            {userName ? (
              <UserIcon className="w-4 h-4 text-violet-300" />
            ) : (
              <Sparkles className="w-4 h-4 text-violet-400" />
            )}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
              {userName ? `Welcome back, ${userName}!` : "Your Active Quizzes"}
            </h2>
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              {userName
                ? "Quizzes linked to this device & browser footprint"
                : "Quizzes you created on this device"}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-violet-300 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/25">
          {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
        </span>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => {
          const isLive = quiz.status === "active";
          const isCopied = copiedCode === quiz.code;

          return (
            <div
              key={quiz.code}
              className="card-surface rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-violet-500/40 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            >
              {/* Top: Status & Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isLive
                        ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-400"
                        : "bg-amber-500/15 border-amber-500/35 text-amber-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isLive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                      }`}
                    />
                    <span>{isLive ? "Live" : "Paused"}</span>
                  </span>

                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    {formatRelativeTime(quiz.createdAt)}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-snug line-clamp-2">
                  {quiz.title}
                </h3>
              </div>

              {/* Middle: Stats Badges */}
              <div className="flex items-center gap-4 py-2.5 border-y border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-violet-400" />
                  <span>
                    <strong className="text-[var(--text-primary)] font-bold">
                      {quiz.stats.attempts}
                    </strong>{" "}
                    responses
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    <strong className="text-[var(--text-primary)] font-bold">
                      {quiz.stats.views}
                    </strong>{" "}
                    views
                  </span>
                </div>
              </div>

              {/* Bottom: Action Buttons (56px min touch target) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {quiz.ownerToken ? (
                  <Link
                    href={`/manage/${quiz.ownerToken}`}
                    className="min-h-[56px] py-4 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:brightness-110 active:scale-[0.98] transition-all font-bold text-xs sm:text-sm shadow-md shadow-violet-600/25 flex items-center justify-center gap-2 cursor-pointer glow-purple"
                  >
                    <KeyRound className="w-4 h-4 text-white/90" />
                    <span>Manage</span>
                    <ChevronRight className="w-4 h-4 text-white/70 ml-auto sm:ml-0" />
                  </Link>
                ) : (
                  <Link
                    href={`/q/${quiz.code}`}
                    className="min-h-[56px] py-4 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:brightness-110 active:scale-[0.98] transition-all font-bold text-xs sm:text-sm shadow-md shadow-violet-600/25 flex items-center justify-center gap-2 cursor-pointer glow-purple"
                  >
                    <Eye className="w-4 h-4 text-white/90" />
                    <span>View Quiz</span>
                    <ChevronRight className="w-4 h-4 text-white/70 ml-auto sm:ml-0" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => handleCopyLink(quiz.code)}
                  className="min-h-[56px] py-4 px-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-violet-500/50 hover:bg-violet-500/10 active:scale-[0.98] transition-all font-semibold text-xs sm:text-sm text-[var(--text-primary)] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">
                        Link Copied!
                      </span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>Share Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
