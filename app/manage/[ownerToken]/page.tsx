import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Eye,
  Users,
  Share2,
  TrendingUp,
  KeyRound,
  Plus,
} from "lucide-react";
import { getOwnerQuizByToken, getQuizAttemptsForOwner } from "@/lib/quiz";
import { ShareCard } from "@/components/quiz/ShareCard";
import { QuizControls } from "@/components/dashboard/QuizControls";
import { Ranking } from "@/components/dashboard/Ranking";
import { ResultList } from "@/components/dashboard/ResultList";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
  const { ownerToken } = await params;
  const quiz = await getOwnerQuizByToken(ownerToken);

  // Friendly 404 UI using empty-quizzes-cozy.svg
  if (!quiz) {
    return (
      <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-center items-center px-4 py-12">
        <Card className="w-full max-w-md rounded-3xl p-6 sm:p-8 text-center space-y-5">
          <div className="w-36 h-32 sm:w-44 sm:h-36 mx-auto flex items-center justify-center">
            <Image
              src="/empty-quizzes-cozy.svg"
              alt="Dashboard Not Found"
              width={180}
              height={150}
              className="w-full h-full object-contain drop-shadow-xs"
              priority
            />
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

          <div className="pt-2 space-y-2.5 w-full">
            <Link href="/create" className="block w-full">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<Plus className="w-4 h-4 text-white/90" />}
              >
                Create a New Quiz
              </Button>
            </Link>

            <Link href="/" className="block w-full">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Return Home
              </Button>
            </Link>
          </div>
        </Card>
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
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <BrandLogo size={32} textClassName="text-base sm:text-lg" />

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/create"
              className="btn-primary-cozy py-1.5 px-3.5 text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-white/90" />
              <span className="hidden sm:inline">New Quiz</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 pt-6 sm:pt-8 space-y-6">
        {/* Title Header */}
        <div className="space-y-2">
          <div className="pill-badge">
            <KeyRound className="w-3.5 h-3.5 text-[var(--color-plum)]" />
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
          <Card className="rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-lavender)]/20 border border-[var(--accent-lavender)]/30 flex items-center justify-center text-[var(--color-plum)]">
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
          </Card>

          {/* 2. Total Attempts */}
          <Card className="rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-plum)]/10 border border-[var(--color-plum)]/20 flex items-center justify-center text-[var(--color-plum)]">
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
          </Card>

          {/* 3. Total Shares */}
          <Card className="rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-rose)]/15 border border-[var(--accent-rose)]/25 flex items-center justify-center text-[var(--accent-rose)]">
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
          </Card>

          {/* 4. Average Match */}
          <Card className="rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-champagne)]/25 border border-[var(--accent-champagne)]/40 flex items-center justify-center text-[#8A5B17]">
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
          </Card>
        </div>

        {/* Quiz Live / Pause Controls (UI-008 & UI-009) */}
        <QuizControls
          quizCode={quiz.code}
          ownerToken={ownerToken}
          initialStatus={quiz.status}
        />

        {/* Viral Share Hub & Secret Dashboard Link (UI-010 & UI-009) */}
        <ShareCard
          quizCode={quiz.code}
          quizTitle={quiz.title}
          ownerToken={ownerToken}
        />

        {/* Live Leaderboard / Friend Rankings with Fixed Badges */}
        <Ranking
          leaderboard={leaderboard}
          quizCode={quiz.code}
          shareUrl={`${process.env.NEXT_PUBLIC_APP_URL || ""}/q/${quiz.code}`}
        />

        {/* Detailed Question Comparison Breakdown */}
        <ResultList history={history} questions={quiz.questions} />
      </main>
    </div>
  );
}
