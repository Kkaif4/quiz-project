import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { Plus, Crown, ArrowRight } from "lucide-react";
import { getPublicQuizByCode, getMatchingOwnerToken } from "@/lib/quiz";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBaseUrl } from "@/lib/seo";
import { Button } from "@/components/ui/Button";

interface QuizPageProps {
  params: Promise<{ quizCode: string }>;
  searchParams?: Promise<{ preview?: string }>;
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

export default async function QuizPage({
  params,
  searchParams,
}: QuizPageProps) {
  const { quizCode } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const preview = resolvedSearchParams?.preview;

  let matchedToken: string | null = null;
  try {
    const cookieStore = await cookies();
    const rawCookie = cookieStore.get("quiz_owner_tokens")?.value;
    let candidateTokens: string[] = [];

    if (rawCookie) {
      try {
        const parsed = JSON.parse(rawCookie);
        if (Array.isArray(parsed)) {
          candidateTokens = parsed.filter(
            (t): t is string => typeof t === "string" && t.length > 0
          );
        }
      } catch {
        if (rawCookie.trim()) {
          candidateTokens = [rawCookie.trim()];
        }
      }
    }

    if (candidateTokens.length > 0) {
      matchedToken = await getMatchingOwnerToken(quizCode, candidateTokens);
    }
  } catch (err) {
    console.warn("Owner cookie check warning:", err);
  }

  // Automatic redirect if owner and not in preview mode
  if (matchedToken) {
    if (preview !== "true") {
      redirect(`/manage/${matchedToken}`);
    }
  }

  const quiz = await getPublicQuizByCode(quizCode, { incrementViews: true });

  if (!quiz) {
    notFound();
  }

  const baseUrl = getBaseUrl();
  const quizUrl = `${baseUrl}/q/${quiz.code}`;

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
      {/* Quiz Structured Data */}
      <JsonLd data={quizSchema} />

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
              <span>Create My Own 🚀</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Owner Preview Floating Banner */}
      {matchedToken && preview === "true" && (
        <div className="bg-[#FACC15]/20 border-b-2 border-[#FACC15]/40 px-4 py-2.5 backdrop-blur-md sticky top-16 z-20">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#FDE047] font-black">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Owner Preview Mode — You created this quiz.</span>
            </div>
            <Link
              href={`/manage/${matchedToken}`}
              className="px-3 py-1.5 rounded-xl bg-[#FACC15] text-[#150E28] font-black transition-all flex items-center gap-1.5 shrink-0 active:scale-95 shadow-[0_2px_0_#CA8A04]"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Game Screen */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col">
        <QuizPlayer
          quiz={quiz}
          matchedOwnerToken={matchedToken || undefined}
          isPreview={preview === "true"}
        />
      </main>
    </div>
  );
}
