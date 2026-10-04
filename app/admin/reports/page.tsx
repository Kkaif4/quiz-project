"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldOff,
  CheckCircle2,
  Check,
  X,
  Lock,
  Unlock,
  RefreshCw,
  AlertCircle,
  Eye,
  Users,
  HelpCircle,
  Ban,
  ArrowLeft,
  Loader2,
  ExternalLink,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type {
  IAdminReportDetails,
  ReportReason,
  ReportStatus,
  QuizStatus,
  AdminModerationAction,
  AdminReportsResponse,
} from "@/types/quiz";
import { cn, formatRelativeTime } from "@/lib/utils";

const FILTER_TABS = [
  { id: "pending", label: "Pending" },
  { id: "reviewed", label: "Reviewed" },
  { id: "resolved", label: "Resolved" },
  { id: "all", label: "All" },
] as const;

type FilterTabId = (typeof FILTER_TABS)[number]["id"];

export default function AdminReportsPage() {
  // Authentication & session state
  const [adminKey, setAdminKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Reports data state
  const [reports, setReports] = useState<IAdminReportDetails[]>([]);
  const [statusFilter, setStatusFilter] = useState<FilterTabId>("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Moderation action in-flight tracking
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    id: string;
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Fetch reports from authenticated endpoint
  const fetchReports = useCallback(
    async (key: string, filter: FilterTabId, targetPage: number) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const queryParams = new URLSearchParams({
          status: filter,
          page: targetPage.toString(),
          limit: "15",
        });

        const res = await fetch(`/api/admin/reports?${queryParams.toString()}`, {
          method: "GET",
          headers: {
            "x-admin-key": key,
            Authorization: `Bearer ${key}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          if (res.status === 401) {
            // Key has expired or is invalid
            setIsUnlocked(false);
            sessionStorage.removeItem("lemon_admin_key");
            throw new Error("Invalid administrative secret key. Please unlock again.");
          }
          throw new Error(data.error || "Failed to load moderation reports.");
        }

        const result = data.data as AdminReportsResponse;
        setReports(result.reports);
        setTotalPages(result.totalPages || 1);
        setTotalCount(result.total || 0);
        setPage(result.page || 1);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Error fetching reports.";
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Restore session key on mount
  useEffect(() => {
    let ignore = false;

    const restoreSession = async () => {
      const savedKey = sessionStorage.getItem("lemon_admin_key");
      if (savedKey && !ignore) {
        setAdminKey(savedKey);
        setIsUnlocked(true);
        await fetchReports(savedKey, "pending", 1);
      }
    };

    restoreSession();

    return () => {
      ignore = true;
    };
  }, [fetchReports]);

  // Handle unlock form submission
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setAuthError("Please enter your administrative secret key.");
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/admin/reports?status=pending&page=1&limit=15", {
        headers: {
          "x-admin-key": trimmed,
          Authorization: `Bearer ${trimmed}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 401) {
          throw new Error("Invalid administrative secret key. Access denied.");
        }
        throw new Error(data.error || "Authentication verification failed.");
      }

      const result = data.data as AdminReportsResponse;
      sessionStorage.setItem("lemon_admin_key", trimmed);
      setAdminKey(trimmed);
      setIsUnlocked(true);
      setReports(result.reports);
      setTotalPages(result.totalPages || 1);
      setTotalCount(result.total || 0);
      setPage(result.page || 1);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to verify administrative key.";
      setAuthError(msg);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Lock and purge session
  const handleLock = () => {
    sessionStorage.removeItem("lemon_admin_key");
    setAdminKey("");
    setInputKey("");
    setIsUnlocked(false);
    setReports([]);
    setErrorMessage(null);
    setAuthError(null);
  };

  // Tab switch
  const handleFilterChange = (tabId: FilterTabId) => {
    setStatusFilter(tabId);
    setPage(1);
    if (adminKey) {
      fetchReports(adminKey, tabId, 1);
    }
  };

  // Pagination navigation
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    if (adminKey) {
      fetchReports(adminKey, statusFilter, newPage);
    }
  };

  // Moderation Action Handler
  const handleModerationAction = async (
    reportId: string,
    action: AdminModerationAction,
  ) => {
    setActionLoadingId(reportId);
    setActionFeedback(null);

    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({
          reportId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Moderation action failed.");
      }

      // Update local report & quiz state
      const { reportStatus, quizStatus } = data.data as {
        reportStatus: ReportStatus;
        quizStatus?: QuizStatus;
      };

      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== reportId) return r;
          return {
            ...r,
            status: reportStatus,
            quiz: r.quiz
              ? {
                  ...r.quiz,
                  status: quizStatus ? quizStatus : r.quiz.status,
                }
              : r.quiz,
          };
        }),
      );

      setActionFeedback({
        id: reportId,
        message: data.message || "Action executed successfully.",
        type: "success",
      });

      // Clear feedback after 3 seconds
      setTimeout(() => {
        setActionFeedback((curr) => (curr?.id === reportId ? null : curr));
      }, 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error executing moderation action.";
      setActionFeedback({
        id: reportId,
        message: msg,
        type: "error",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper for flagged reason styling
  const getReasonConfig = (reason: ReportReason) => {
    switch (reason) {
      case "spam":
        return {
          label: "Spam / Scam",
          icon: AlertCircle,
          pillClass: "bg-amber-500/15 text-amber-300 border-amber-500/35",
        };
      case "harassment":
        return {
          label: "Harassment",
          icon: ShieldAlert,
          pillClass: "bg-rose-500/15 text-rose-300 border-rose-500/35",
        };
      case "sexual":
        return {
          label: "Inappropriate / Sexual",
          icon: ShieldAlert,
          pillClass: "bg-purple-500/15 text-purple-300 border-purple-500/35",
        };
      case "hate":
        return {
          label: "Hate Speech",
          icon: Ban,
          pillClass: "bg-red-500/15 text-red-300 border-red-500/35",
        };
      case "impersonation":
        return {
          label: "Impersonation",
          icon: Users,
          pillClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/35",
        };
      case "other":
      default:
        return {
          label: "Other Violation",
          icon: HelpCircle,
          pillClass: "bg-violet-500/15 text-violet-300 border-violet-500/30",
        };
    }
  };

  // Helper for report status badge
  const getStatusConfig = (status: ReportStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          icon: AlertCircle,
          pillClass: "bg-amber-500/15 text-amber-300 border-amber-500/35",
        };
      case "reviewed":
        return {
          label: "Reviewed",
          icon: Eye,
          pillClass: "bg-sky-500/15 text-sky-300 border-sky-500/35",
        };
      case "resolved":
        return {
          label: "Resolved",
          icon: CheckCircle2,
          pillClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35",
        };
    }
  };

  // SCREEN 1: LOCKED / ADMIN KEY PROMPT
  if (!isUnlocked) {
    return (
      <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md card-surface rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_12px_45px_rgb(0,0,0,0.25)] border border-[var(--card-border)] glow-purple">
          <div className="text-center space-y-3">
            {/* Rule 4: Lucide icon inside duotone container pill */}
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-xs">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                Moderation Console
              </h1>
              <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
                Enter your administrative secret key to access and moderate content reports.
              </p>
            </div>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label
                htmlFor="admin-key-input"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2"
              >
                Administrative Secret Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-violet-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="admin-key-input"
                  type="password"
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Enter secret key..."
                  autoFocus
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 text-[var(--text-primary)] font-mono text-sm placeholder:font-sans placeholder:text-[var(--text-muted)] outline-none transition-all min-h-[56px]"
                />
              </div>

              {authError && (
                <div className="mt-2.5 flex items-center gap-1.5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            {/* Rule 4: Minimum 56px touch target, active tactile scaling */}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full min-h-[56px] py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-black text-base shadow-lg shadow-violet-600/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 glow-purple"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5 text-white/90" />
                  <span>Unlock Console</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // SCREEN 2: UNLOCKED MODERATION DASHBOARD
  return (
    <div className="min-h-screen text-[var(--text-primary)] pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-[var(--text-primary)] tracking-tight text-base sm:text-lg">
              Moderation Console
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchReports(adminKey, statusFilter, page)}
              disabled={isLoading}
              title="Refresh reports"
              aria-label="Refresh reports"
              className="p-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-violet-500/10 active:scale-[0.98] transition-all text-[var(--text-primary)] cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw
                className={cn("w-4 h-4", isLoading && "animate-spin")}
              />
            </button>
            <button
              type="button"
              onClick={handleLock}
              title="Lock console"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/25 text-violet-300 text-xs font-bold active:scale-[0.98] transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 pt-6 sm:pt-8 space-y-6">
        {/* Header Title Section */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs font-bold shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Content Safety &amp; Abuse Reports</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Moderation Console
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            Review reported friendship quizzes, examine violation details, and regulate platform availability.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTER_TABS.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleFilterChange(tab.id)}
                className={cn(
                  "min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap",
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs glow-purple"
                    : "card-surface text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-violet-500/40",
                )}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[10px]">
                    {totalCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs sm:text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchReports(adminKey, statusFilter, page)}
              className="underline font-bold hover:text-rose-200 ml-4 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && reports.length === 0 && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="card-surface rounded-3xl p-6 space-y-4 animate-pulse shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="w-28 h-6 bg-violet-500/15 rounded-full" />
                  <div className="w-20 h-5 bg-violet-500/15 rounded-full" />
                </div>
                <div className="w-3/4 h-5 bg-violet-500/15 rounded-lg" />
                <div className="w-full h-16 bg-violet-500/10 rounded-2xl" />
                <div className="w-full h-14 bg-violet-500/15 rounded-2xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && reports.length === 0 && (
          <div className="card-surface rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                No reports found
              </h2>
              <p className="text-sm font-medium text-[var(--text-secondary)] max-w-sm mx-auto">
                {statusFilter === "pending"
                  ? "All clear! There are no pending reports awaiting moderation."
                  : `No reports currently match the '${statusFilter}' filter.`}
              </p>
            </div>
            {statusFilter !== "all" && (
              <button
                type="button"
                onClick={() => handleFilterChange("all")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-violet-500/10 active:scale-[0.98] transition-all text-xs font-bold text-[var(--text-primary)] cursor-pointer"
              >
                <span>View All Reports</span>
              </button>
            )}
          </div>
        )}

        {/* Reports Cards List */}
        {reports.length > 0 && (
          <div className="space-y-4">
            {reports.map((report) => {
              const reasonConfig = getReasonConfig(report.reason);
              const ReasonIcon = reasonConfig.icon;
              const statusConfig = getStatusConfig(report.status);
              const StatusIcon = statusConfig.icon;
              const isWorking = actionLoadingId === report.id;
              const feedback =
                actionFeedback?.id === report.id ? actionFeedback : null;

              return (
                <div
                  key={report.id}
                  className="card-surface rounded-3xl p-5 sm:p-7 space-y-5 shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-all"
                >
                  {/* Top Bar: Reason Badge + Status Badge + Timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Flagged Reason Badge */}
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-xs",
                          reasonConfig.pillClass,
                        )}
                      >
                        <ReasonIcon className="w-3.5 h-3.5" />
                        <span>{reasonConfig.label}</span>
                      </div>

                      {/* Report Status Badge */}
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold",
                          statusConfig.pillClass,
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusConfig.label}</span>
                      </div>
                    </div>

                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      Reported {formatRelativeTime(report.createdAt)}
                    </span>
                  </div>

                  {/* Reporter Description Section */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Reporter Comments
                    </span>
                    <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                      <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed break-words">
                        {report.description
                          ? report.description
                          : "No additional comments provided by the reporter."}
                      </p>
                    </div>
                  </div>

                  {/* Associated Quiz Metadata Card */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Associated Quiz
                    </span>

                    {report.quiz ? (
                      <div className="p-4 rounded-2xl border border-[var(--card-border)] bg-violet-500/5 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0 pr-2">
                            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight leading-snug break-words">
                              {report.quiz.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                              <span>Code: {report.quiz.code}</span>
                              <Link
                                href={`/q/${report.quiz.code}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 underline font-sans font-semibold cursor-pointer"
                              >
                                <span>Preview</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>

                          {/* Quiz Active/Disabled Status Badge */}
                          <div
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0",
                              report.quiz.status === "active"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/35"
                                : "bg-rose-500/15 text-rose-400 border-rose-500/35",
                            )}
                          >
                            {report.quiz.status === "active" ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5" />
                                <span>Disabled</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Quiz Metrics (Views, Attempts, Questions) */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold text-[var(--text-secondary)]">
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-violet-400" />
                            <span>{report.quiz.stats.views} Views</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-violet-400/40" />
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-violet-400" />
                            <span>{report.quiz.stats.attempts} Attempts</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-violet-400/40" />
                          <div className="flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-violet-400" />
                            <span>{report.quiz.questionsCount} Questions</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-violet-400 shrink-0" />
                        <span>Quiz was deleted or no longer exists in database.</span>
                      </div>
                    )}
                  </div>

                  {/* Action Feedback Banner */}
                  {feedback && (
                    <div
                      className={cn(
                        "p-3 rounded-xl border text-xs font-semibold flex items-center gap-2",
                        feedback.type === "success"
                          ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
                          : "bg-rose-500/15 border-rose-500/35 text-rose-300",
                      )}
                    >
                      {feedback.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  {/* Moderation Actions Deck (Strict Rule 4: min 56px touch target buttons, active tactile scaling) */}
                  <div className="pt-2 border-t border-[var(--border-subtle)]">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
                      Moderation Actions
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {/* Action 1: Disable / Activate Quiz */}
                      {report.quiz?.status === "active" ? (
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() =>
                            handleModerationAction(report.id, "disable_quiz")
                          }
                          className="min-h-[56px] px-4 py-3 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-rose-300 hover:bg-rose-500/25 font-bold text-xs sm:text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isWorking ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ShieldOff className="w-4 h-4 text-rose-400" />
                          )}
                          <span>Disable Quiz</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isWorking || !report.quiz}
                          onClick={() =>
                            handleModerationAction(report.id, "activate_quiz")
                          }
                          className="min-h-[56px] px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 hover:bg-emerald-500/25 font-bold text-xs sm:text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isWorking ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                          <span>Activate Quiz</span>
                        </button>
                      )}

                      {/* Action 2: Mark Resolved */}
                      <button
                        type="button"
                        disabled={isWorking || report.status === "resolved"}
                        onClick={() =>
                          handleModerationAction(report.id, "resolve")
                        }
                        className={cn(
                          "min-h-[56px] px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50",
                          report.status === "resolved"
                            ? "bg-violet-500/10 text-[var(--text-muted)] border border-violet-500/20 cursor-not-allowed"
                            : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:brightness-110 shadow-md shadow-violet-600/25 glow-purple",
                        )}
                      >
                        {isWorking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 text-emerald-300" />
                        )}
                        <span>
                          {report.status === "resolved"
                            ? "Resolved"
                            : "Mark Resolved"}
                        </span>
                      </button>

                      {/* Action 3: Dismiss */}
                      <button
                        type="button"
                        disabled={isWorking || report.status === "reviewed"}
                        onClick={() =>
                          handleModerationAction(report.id, "dismiss")
                        }
                        className={cn(
                          "min-h-[56px] px-4 py-3 rounded-2xl border font-semibold text-xs sm:text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50",
                          report.status === "reviewed"
                            ? "border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-muted)] cursor-not-allowed"
                            : "border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-violet-500/10 text-[var(--text-primary)]",
                        )}
                      >
                        {isWorking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4 text-[var(--text-muted)]" />
                        )}
                        <span>
                          {report.status === "reviewed"
                            ? "Dismissed"
                            : "Dismiss"}
                        </span>
                      </button>

                      {/* Action 4: Quick Preview link */}
                      {report.quiz ? (
                        <Link
                          href={`/q/${report.quiz.code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="min-h-[56px] px-4 py-3 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-violet-500/10 font-semibold text-xs sm:text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[var(--text-primary)]"
                        >
                          <ExternalLink className="w-4 h-4 text-violet-400" />
                          <span>Open Quiz</span>
                        </Link>
                      ) : (
                        <div className="min-h-[56px] px-4 py-3 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-muted)] text-xs font-semibold flex items-center justify-center">
                          Unavailable
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => handlePageChange(page - 1)}
              className="min-h-[56px] px-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-violet-500/10 active:scale-[0.98] transition-all text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs sm:text-sm font-bold text-[var(--text-muted)]">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => handlePageChange(page + 1)}
              className="min-h-[56px] px-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-violet-500/10 active:scale-[0.98] transition-all text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
