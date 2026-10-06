"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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

        // 1. Sync via Browser Blueprint
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
                        JSON.stringify(storedTokens.slice(0, 50)),
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
          if (serverQuizzes.length > 0) {
            const serverTokens = serverQuizzes
              .map((q) => q.ownerToken)
              .filter(
                (t): t is string => typeof t === "string" && t.length > 0,
              );
            localStorage.setItem(
              "quiz_owner_tokens",
              JSON.stringify(serverTokens),
            );
          }
          return;
        }

        const knownTokens = new Set(
          quizzes.map((q) => q.ownerToken).filter(Boolean),
        );
        const missingTokens = localTokens.filter(
          (token) => !knownTokens.has(token),
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

  // Upgraded Empty State using empty-quizzes-cozy.svg
  if (quizzes.length === 0) {
    return (
      <Card className="w-full rounded-3xl p-6 sm:p-8 text-center space-y-4 pt-6">
        <Image
          src="/empty-quizzes-cozy.svg"
          alt="No quizzes yet"
          width={180}
          height={150}
          className="mx-auto object-contain drop-shadow-xs"
        />
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
            {userName ? `Welcome back, ${userName}!` : "Your Active Quizzes"}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] max-w-sm mx-auto">
            {userName
              ? "You haven't created any quizzes on this device yet. Ready to make a personalized challenge for your friends?"
              : "No quizzes found on this device yet. Create one now and challenge your friends!"}
          </p>
        </div>
        <Link href="/create" className="inline-block max-w-full">
          <Button
            variant="premium"
            size="lg"
            leftIcon={<Sparkles className="w-4 h-4 text-[#8A5B17]" />}
          >
            Create Your First Quiz
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <section className="w-full space-y-4 pt-2 sm:pt-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[var(--color-plum)]/10 border border-[var(--color-plum)]/20 flex items-center justify-center text-[var(--color-plum)] shadow-xs">
            {userName ? (
              <UserIcon className="w-4 h-4 text-[var(--color-plum)]" />
            ) : (
              <Sparkles className="w-4 h-4 text-[var(--color-plum)]" />
            )}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
              {userName ? `Welcome back, ${userName}!` : "Your Active Quizzes"}
            </h2>
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              {userName
                ? "Quizzes linked to this device"
                : "Quizzes you created on this device"}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-[var(--color-plum)] px-3 py-1 rounded-full bg-[var(--color-plum)]/10 border border-[var(--color-plum)]/20">
          {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
        </span>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => {
          const isLive = quiz.status === "active";
          const isCopied = copiedCode === quiz.code;

          return (
            <Card
              key={quiz.code}
              className="rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-[var(--color-plum)]/30 transition-all"
            >
              {/* Top: Status & Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isLive
                        ? "bg-[var(--accent-sage)]/15 border-[var(--accent-sage)]/35 text-[var(--accent-sage)]"
                        : "bg-[var(--accent-champagne)]/25 border-[var(--accent-champagne)]/40 text-[#8A5B17]"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isLive
                          ? "bg-[var(--accent-sage)] animate-pulse"
                          : "bg-[#8A5B17]"
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
                  <Users className="w-3.5 h-3.5 text-[var(--color-plum)]" />
                  <span>
                    <strong className="text-[var(--text-primary)] font-bold">
                      {quiz.stats.attempts}
                    </strong>{" "}
                    responses
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[var(--color-plum)]" />
                  <span>
                    <strong className="text-[var(--text-primary)] font-bold">
                      {quiz.stats.views}
                    </strong>{" "}
                    views
                  </span>
                </div>
              </div>

              {/* Bottom: Action Buttons (UI-009 overflow safe) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 w-full">
                {quiz.ownerToken ? (
                  <Link href={`/manage/${quiz.ownerToken}`} className="w-full">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      className="px-3"
                      leftIcon={<KeyRound className="w-4 h-4 text-white/90" />}
                      rightIcon={<ChevronRight className="w-4 h-4 text-white/70 ml-auto sm:ml-0" />}
                    >
                      <span>Manage</span>
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/q/${quiz.code}`} className="w-full">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      className="px-3"
                      leftIcon={<Eye className="w-4 h-4 text-white/90" />}
                      rightIcon={<ChevronRight className="w-4 h-4 text-white/70 ml-auto sm:ml-0" />}
                    >
                      <span>View Quiz</span>
                    </Button>
                  </Link>
                )}

                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="px-3"
                  onClick={() => handleCopyLink(quiz.code)}
                  leftIcon={
                    isCopied ? (
                      <Check className="w-4 h-4 text-[var(--accent-sage)]" />
                    ) : (
                      <Share2 className="w-4 h-4 text-[var(--text-muted)]" />
                    )
                  }
                >
                  <span>{isCopied ? "Link Copied!" : "Share Link"}</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
