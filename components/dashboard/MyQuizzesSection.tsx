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
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface MyQuizzesSectionProps {
  serverQuizzes: IUserQuizSummary[];
}

export function MyQuizzesSection({ serverQuizzes }: MyQuizzesSectionProps) {
  const [quizzes, setQuizzes] = useState<IUserQuizSummary[]>(serverQuizzes);
  const [userName, setUserName] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sync client-side localStorage tokens and browser footprint with server
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
                const newQuizzes: IUserQuizSummary[] = data.data.quizzes;

                try {
                  if (window.localStorage) {
                    const raw = localStorage.getItem("quiz_owner_tokens");
                    const storedTokens: string[] = raw ? JSON.parse(raw) : [];
                    const tokenSet = new Set(storedTokens);
                    let tokensUpdated = false;

                    for (const q of newQuizzes) {
                      if (
                        q.ownerToken &&
                        typeof q.ownerToken === "string" &&
                        q.ownerToken.length > 0 &&
                        !tokenSet.has(q.ownerToken)
                      ) {
                        tokenSet.add(q.ownerToken);
                        storedTokens.unshift(q.ownerToken);
                        tokensUpdated = true;
                      }
                    }

                    if (tokensUpdated) {
                      localStorage.setItem(
                        "quiz_owner_tokens",
                        JSON.stringify(storedTokens.slice(0, 50))
                      );
                    }
                  }
                } catch (storageErr) {
                  console.warn("Could not sync tokens to localStorage:", storageErr);
                }

                setQuizzes((prev) => {
                  const quizMap = new Map<string, IUserQuizSummary>();
                  for (const q of prev) {
                    quizMap.set(q.code, q);
                  }
                  for (const q of newQuizzes) {
                    const existing = quizMap.get(q.code);
                    if (!existing) {
                      quizMap.set(q.code, q);
                    } else {
                      quizMap.set(q.code, {
                        ...existing,
                        ...q,
                        ownerToken: q.ownerToken || existing.ownerToken || "",
                      });
                    }
                  }
                  return Array.from(quizMap.values()).sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
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
          if (serverQuizzes.length > 0) {
            const serverTokens = serverQuizzes
              .map((q) => q.ownerToken)
              .filter((t): t is string => typeof t === "string" && t.length > 0);
            localStorage.setItem(
              "quiz_owner_tokens",
              JSON.stringify(serverTokens)
            );
          }
          return;
        }

        const knownTokens = new Set(
          quizzes.map((q) => q.ownerToken).filter(Boolean)
        );
        const missingTokens = localTokens.filter(
          (token) => !knownTokens.has(token)
        );

        if (missingTokens.length > 0) {
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
                setQuizzes((prev) => {
                  const quizMap = new Map<string, IUserQuizSummary>();
                  for (const q of prev) {
                    quizMap.set(q.code, q);
                  }
                  for (const q of fetchedQuizzes) {
                    const existing = quizMap.get(q.code);
                    if (!existing) {
                      quizMap.set(q.code, q);
                    } else {
                      quizMap.set(q.code, {
                        ...existing,
                        ...q,
                        ownerToken: q.ownerToken || existing.ownerToken || "",
                      });
                    }
                  }
                  return Array.from(quizMap.values()).sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
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
          <div className="w-10 h-10 rounded-2xl bg-[#FFB830]/15 border-2 border-[#FFB830]/30 flex items-center justify-center text-xl shrink-0">
            {userName ? "👑" : "✨"}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
              {userName ? `Welcome back, ${userName}!` : "Your Active Squad Quizzes"}
            </h2>
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              {userName
                ? "Quizzes linked to your device blueprint"
                : "Manage rankings and inspect friend responses"}
            </p>
          </div>
        </div>

        <Badge variant="lemon" tilt="right">
          <span>
            {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
          </span>
        </Badge>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => {
          const isLive = quiz.status === "active";
          const isCopied = copiedCode === quiz.code;

          return (
            <div
              key={quiz.code}
              className="card-surface rounded-3xl p-5 sm:p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Status Badges */}
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={isLive ? "mint" : "slate"}>
                    <span className={`w-2 h-2 rounded-full ${isLive ? "bg-[#10B981] animate-pulse" : "bg-slate-400"}`} />
                    <span>{isLive ? "Active Live" : "Closed"}</span>
                  </Badge>

                  <span className="text-[11px] font-bold text-[var(--text-muted)]">
                    {formatRelativeTime(quiz.createdAt)}
                  </span>
                </div>

                {/* Quiz Title */}
                <div>
                  <h3 className="font-black text-lg text-[var(--text-primary)] tracking-tight line-clamp-1">
                    {quiz.title}
                  </h3>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-[var(--card-bg)] border-2 border-[var(--card-border)] text-center text-xs font-bold">
                  <div>
                    <span className="block text-[var(--text-muted)] text-[10px] uppercase">
                      Attempts
                    </span>
                    <span className="font-black text-[#FFB830] text-sm">
                      {quiz.stats?.attempts || 0}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[var(--text-muted)] text-[10px] uppercase">
                      Views
                    </span>
                    <span className="font-black text-[var(--text-primary)] text-sm">
                      {quiz.stats?.views || 0}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[var(--text-muted)] text-[10px] uppercase">
                      Shares
                    </span>
                    <span className="font-black text-[#B47AFF] text-sm">
                      {quiz.stats?.shares || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t-2 border-[var(--border-subtle)]">
                {quiz.ownerToken ? (
                  <Link
                    href={`/manage/${quiz.ownerToken}`}
                    className="flex-1 block"
                  >
                    <Button variant="lemon" size="md" fullWidth>
                      <KeyRound className="w-4 h-4 text-[#2D1B0E]" />
                      <span>Leaderboard</span>
                      <ChevronRight className="w-4 h-4 text-[#2D1B0E]" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/q/${quiz.code}`} className="flex-1 block">
                    <Button variant="ghost" size="md" fullWidth>
                      <Eye className="w-4 h-4 text-[#B47AFF]" />
                      <span>View Quiz</span>
                    </Button>
                  </Link>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => handleCopyLink(quiz.code)}
                  className="px-4 shrink-0"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-[#1EAA78]" />
                  ) : (
                    <Share2 className="w-4 h-4 text-[#FFB830]" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
