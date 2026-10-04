import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Sparkles, Plus } from "lucide-react";
import { getPublicQuizByCode } from "@/lib/quiz";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBaseUrl } from "@/lib/seo";

interface QuizPageProps {
  params: Promise<{ quizCode: string }>;
}

export async function generateMetadata({
  params,
}: QuizPageProps): Promise<Metadata> {
  const { quizCode } = await params;
  const quiz = await getPublicQuizByCode(quizCode);

  if (!quiz) {
    return {
      title: "Quiz Not Found — LemonQuiz",
      description: "The requested friendship quiz does not exist or has ended.",
    };
  }

  const ogUrl = `/api/og?type=quiz&title=${encodeURIComponent(quiz.title)}&questionsCount=${quiz.questions?.length || 6}`;
  const description =
    quiz.description ||
    "Take this quick friendship test and see how high you score on the leaderboard!";

  return {
    title: `${quiz.title} — LemonQuiz`,
    description,
    alternates: {
      canonical: `/q/${quizCode}`,
    },
    openGraph: {
      title: `${quiz.title} — LemonQuiz`,
      description,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: quiz.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${quiz.title} — LemonQuiz`,
      description,
      images: [ogUrl],
    },
  };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { quizCode } = await params;
  const quiz = await getPublicQuizByCode(quizCode, { incrementViews: true });

  if (!quiz) {
    notFound();
  }

  const baseUrl = getBaseUrl();
  const quizUrl = `${baseUrl}/q/${quiz.code}`;

  // ZERO ANSWER KEY LEAKAGE SECURITY INVARIANT:
  // hasPart provides questions and suggestedAnswer options only.
  // acceptedAnswer and correctOptionId are NEVER emitted into JSON-LD.
  const quizSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Quiz",
        "@id": `${quizUrl}/#quiz`,
        name: quiz.title,
        description:
          quiz.description ||
          `Take this friendship quiz to see how well you know ${quiz.title}.`,
        url: quizUrl,
        learningResourceType: "Quiz",
        educationalLevel: "All",
        about: {
          "@type": "Thing",
          name: "Friendship Trivia",
        },
        hasPart: quiz.questions.map((q, idx) => ({
          "@type": "Question",
          name: q.text,
          position: idx + 1,
          suggestedAnswer: q.options.map((opt) => ({
            "@type": "Answer",
            text: opt.text,
          })),
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${quizUrl}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: quiz.title,
            item: quizUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col justify-between">
      {/* Quiz Structured Data (Zero Answer Leakage) */}
      <JsonLd data={quizSchema} />

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
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create My Own</span>
          </Link>
        </div>
      </header>

      {/* Main Game Screen */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col">
        <QuizPlayer quiz={quiz} />
      </main>
    </div>
  );
}
