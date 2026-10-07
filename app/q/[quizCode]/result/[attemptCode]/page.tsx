import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAttemptResultByCode } from "@/lib/quiz";
import { QuizResult } from "@/components/quiz/QuizResult";
import { Button } from "@/components/ui/Button";

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
    alternates: {
      canonical: `/q/${quizCode}`,
    },
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
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b-2 border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
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
              <span>Create Quiz 🚀</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Result Screen */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col">
        <QuizResult result={result} />
      </main>
    </div>
  );
}
