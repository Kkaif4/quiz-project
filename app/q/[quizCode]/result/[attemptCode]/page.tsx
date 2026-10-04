import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Sparkles, Plus } from "lucide-react";
import { getAttemptResultByCode } from "@/lib/quiz";
import { QuizResult } from "@/components/quiz/QuizResult";

interface ResultPageProps {
  params: Promise<{
    quizCode: string;
    attemptCode: string;
  }>;
}

export async function generateMetadata({
  params,
}: ResultPageProps): Promise<Metadata> {
  const { quizCode, attemptCode } = await params;
  const result = await getAttemptResultByCode(quizCode, attemptCode);

  if (!result) {
    return {
      title: "Result Not Found — LemonQuiz",
      description: "This quiz result does not exist or has expired.",
    };
  }

  const ogUrl = `/api/og?type=result&title=${encodeURIComponent(result.quizTitle)}&nickname=${encodeURIComponent(result.nickname)}&score=${result.score}&total=${result.total}&percentage=${result.percentage}`;
  const title = `${result.nickname}'s Score (${result.percentage}%) — LemonQuiz`;
  const description = `See how ${result.nickname} scored on "${result.quizTitle}". Test your friendship now!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: `${result.nickname}'s Score on ${result.quizTitle}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { quizCode, attemptCode } = await params;
  const result = await getAttemptResultByCode(quizCode, attemptCode);

  if (!result) {
    notFound();
  }

  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
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
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:brightness-110 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 glow-purple"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Quiz</span>
          </Link>
        </div>
      </header>

      {/* Main Result Screen */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col justify-center">
        <QuizResult result={result} />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
        <span>LemonQuiz · The Ultimate Friendship Test</span>
      </footer>
    </div>
  );
}
