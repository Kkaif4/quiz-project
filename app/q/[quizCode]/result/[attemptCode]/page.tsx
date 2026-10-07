import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAttemptResultByCode } from "@/lib/quiz";
import { QuizResult } from "@/components/quiz/QuizResult";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
      robots: {
        index: false,
        follow: false,
        noarchive: true,
      },
    };
  }

  const ogUrl = `/api/og?type=result&title=${encodeURIComponent(result.quizTitle)}&nickname=${encodeURIComponent(result.nickname)}&score=${result.score}&total=${result.total}&percentage=${result.percentage}`;
  const title = `${result.nickname}'s Score (${result.percentage}%) — LemonQuiz`;
  const description = `See how ${result.nickname} scored on "${result.quizTitle}". Test your friendship now!`;

  return {
    title,
    description,
    // Consolidate link and ranking equity to root quiz
    alternates: {
      canonical: `/q/${quizCode}`,
    },
    // Prevent crawl budget exhaustion on unbounded individual results
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
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
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <BrandLogo size={32} textClassName="text-base sm:text-lg" />

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/create"
              className="btn-primary-cozy py-2 px-3.5 text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-white/90" />
              <span>Create Quiz</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Result Screen */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col justify-center">
        <QuizResult result={result} />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
        <span>LemonQuiz &bull; The Cozy Friendship Test</span>
      </footer>
    </div>
  );
}
