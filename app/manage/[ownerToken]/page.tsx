import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
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
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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

  if (!quiz) {
    return (
      <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md card-surface rounded-3xl p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-[#FACC15]/15 border-2 border-[#FACC15]/30 mx-auto flex items-center justify-center text-3xl animate-bounce">
            🛸
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
            <Link href="/create" className="block">
              <Button variant="lemon" size="lg" fullWidth>
                <Plus className="w-4 h-4 text-[#150E28]" />
                <span>Create a New Quiz</span>
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="ghost" size="md" fullWidth>
                <ArrowLeft className="w-4 h-4 text-[#C084FC]" />
                <span>Return Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { leaderboard, history, averageScore } = await getQuizAttemptsForOwner(
    quiz._id || ""
  );

  return (
    <div className="min-h-screen text-[var(--text-primary)] pb-16">
      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b-2 border-[var(--border-subtle)]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[#FACC15] transition-colors text-sm font-black cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <Link href="/" className="inline-flex items-center group">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border-2 border-[#2D1B0E] shadow-[0_3px_0_#2D1B0E] group-hover:-translate-y-0.5 group-hover:shadow-[0_4px_0_#2D1B0E] active:translate-y-[2px] active:shadow-[0_0px_0_#2D1B0E] transition-all">
              <span className="text-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">🍋</span>
              <span className="font-black tracking-tight text-base sm:text-lg">
                <span className="text-[#2D1B0E]">Lemon</span><span className="text-[#FF6B8A]">Quiz</span>
              </span>
            </div>
          </Link>

          <Link href="/create">
            <Button variant="lemon" size="sm">
              <Plus className="w-3.5 h-3.5 text-[#2D1B0E]" />
              <span className="hidden sm:inline">New Quiz</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 pt-6 sm:pt-8 space-y-6">
        {/* Title Header */}
        <div className="space-y-2">
          <div className="flex">
            <Badge variant="lemon" tilt="left">
              <KeyRound className="w-3.5 h-3.5 text-[#150E28]" />
              <span>Host Dashboard 👑</span>
            </Badge>
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
          <div className="card-surface rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#6366F1]/15 border-2 border-[#6366F1]/30 flex items-center justify-center text-indigo-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {quiz.stats.views}
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                Total Views
              </span>
            </div>
          </div>

          {/* 2. Total Attempts */}
          <div className="card-surface rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#FACC15]/15 border-2 border-[#FACC15]/30 flex items-center justify-center text-[#FACC15]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#FACC15] tracking-tight">
                {quiz.stats.attempts}
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                Responses
              </span>
            </div>
          </div>

          {/* 3. Total Shares */}
          <div className="card-surface rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#FF4D6D]/15 border-2 border-[#FF4D6D]/30 flex items-center justify-center text-pink-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {quiz.stats.shares}
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                Shares
              </span>
            </div>
          </div>

          {/* 4. Average Match */}
          <div className="card-surface rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/15 border-2 border-[#8B5CF6]/30 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {averageScore}%
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">
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
          shareUrl={`${process.env.NEXT_PUBLIC_APP_URL}/q/${quiz.code}`}
        />

        {/* Detailed Question Comparison Breakdown */}
        <ResultList history={history} questions={quiz.questions} />
      </main>
    </div>
  );
}
