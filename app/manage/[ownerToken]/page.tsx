import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Eye,
  Users,
  Share2,
  TrendingUp,
  KeyRound,
  AlertCircle,
  Plus,
} from "lucide-react";
import { getOwnerQuizByToken, getQuizAttemptsForOwner } from "@/lib/quiz";
import { ShareCard } from "@/components/quiz/ShareCard";
import { QuizControls } from "@/components/dashboard/QuizControls";
import { Ranking } from "@/components/dashboard/Ranking";
import { ResultList } from "@/components/dashboard/ResultList";

interface ManagePageProps {
  params: Promise<{ ownerToken: string }>;
}

export async function generateMetadata({
  params,
}: ManagePageProps): Promise<Metadata> {
  const { ownerToken } = await params;
  const quiz = await getOwnerQuizByToken(ownerToken);

  if (!quiz) {
    return {
      title: "Quiz Not Found — LemonQuiz",
      description: "The requested quiz owner dashboard does not exist.",
      robots: { index: false, follow: false, noarchive: true },
    };
  }

  return {
    title: `Dashboard: ${quiz.title} — LemonQuiz`,
    description: "Inspect live leaderboard, friend responses, and quiz status.",
    robots: { index: false, follow: false, noarchive: true },
  };
}

export default async function ManagePage({ params }: ManagePageProps) {
  // Await params per Next.js 16 Canary and React 19 rules
  const { ownerToken } = await params;

  const quiz = await getOwnerQuizByToken(ownerToken);

  // Friendly 404 UI if token is invalid or quiz deleted
  if (!quiz) {
    return (
      <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md card-surface rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.15)]">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/30 mx-auto flex items-center justify-center text-violet-400 shadow-xs">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Dashboard Not Found
            </h1>
            <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              We couldn&apos;t find an active quiz linked to this private token.
              Please check that you copied the complete management link.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <Link
              href="/create"
              className="w-full min-h-[56px] py-4 px-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:brightness-110 active:scale-[0.98] transition-all font-bold text-sm shadow-md shadow-violet-600/30 flex items-center justify-center gap-2 glow-purple"
            >
              <Plus className="w-4 h-4" />
              <span>Create a New Quiz</span>
            </Link>

            <Link
              href="/"
              className="w-full min-h-[52px] py-3.5 px-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-violet-500/50 hover:bg-violet-500/10 active:scale-[0.98] transition-all font-semibold text-sm text-[var(--text-secondary)] flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Load leaderboard, history, and average score
  const { leaderboard, history, averageScore } = await getQuizAttemptsForOwner(
    quiz._id || "",
  );

  return (
    <div className="min-h-screen text-[var(--text-primary)] pb-16">
      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/35 flex items-center justify-center text-violet-300 shadow-xs glow-purple">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-[var(--text-primary)] tracking-tight text-base sm:text-lg">
              LemonQuiz
            </span>
          </Link>

          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-xs glow-purple"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Quiz</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 pt-6 sm:pt-8 space-y-6">
        {/* Title Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold shadow-xs">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Owner Dashboard</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {quiz.title}
          </h1>

          {quiz.description && (
            <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              {quiz.description}
            </p>
          )}
        </div>

        {/* 4 Minimalist Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Total Views */}
          <div className="card-surface rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {quiz.stats.views}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Total Views
              </span>
            </div>
          </div>

          {/* 2. Total Attempts */}
          <div className="card-surface rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {quiz.stats.attempts}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Responses
              </span>
            </div>
          </div>

          {/* 3. Total Shares */}
          <div className="card-surface rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {quiz.stats.shares}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Shares
              </span>
            </div>
          </div>

          {/* 4. Average Match */}
          <div className="card-surface rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {averageScore}%
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Avg Match
              </span>
            </div>
          </div>
        </div>

        {/* Quiz Live / Pause Controls */}
        <QuizControls
          quizCode={quiz.code}
          ownerToken={ownerToken}
          initialStatus={quiz.status}
        />

        {/* Viral Share Hub & Secret Dashboard Link */}
        <ShareCard
          quizCode={quiz.code}
          quizTitle={quiz.title}
          ownerToken={ownerToken}
        />

        {/* Live Leaderboard / Friend Rankings */}
        <Ranking
          leaderboard={leaderboard}
          quizCode={quiz.code}
          shareUrl={`/q/${quiz.code}`}
        />

        {/* Detailed Question Comparison Breakdown */}
        <ResultList history={history} questions={quiz.questions} />
      </main>
    </div>
  );
}
