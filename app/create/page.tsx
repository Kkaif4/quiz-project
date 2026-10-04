import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { QuizCreator } from "@/components/quiz/QuizCreator";

export const metadata: Metadata = {
  title: "Create a Friendship Quiz — LemonQuiz",
  description:
    "Create your personalized friendship test in 60 seconds, share with friends, and see who knows you best.",
  alternates: {
    canonical: "/create",
  },
  openGraph: {
    title: "Create a Friendship Quiz — LemonQuiz",
    description:
      "Create your personalized friendship test in 60 seconds, share with friends, and see who knows you best.",
    images: ["/api/og?type=create"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create a Friendship Quiz — LemonQuiz",
    description:
      "Create your personalized friendship test in 60 seconds, share with friends, and see who knows you best.",
    images: ["/api/og?type=create"],
  },
};

interface CreatePageProps {
  searchParams: Promise<{ template?: string }>;
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const resolvedParams = await searchParams;
  const initialTemplateId = resolvedParams?.template;

  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col">
      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
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

          <div className="w-14" /> {/* Balance spacer */}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-6 sm:pt-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Quick Creator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Create Your Friendship Test
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
            Pick a preset or customize questions. Choose your secret answers,
            review, and publish your shareable quiz.
          </p>
        </div>

        <QuizCreator initialTemplateId={initialTemplateId} />
      </main>
    </div>
  );
}
