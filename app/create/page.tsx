import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuizCreator } from "@/components/quiz/QuizCreator";
import { Badge } from "@/components/ui/Badge";

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
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b-2 border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[#FF8C42] transition-colors text-sm font-black cursor-pointer"
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

          <div className="w-14" /> {/* Balance spacer */}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-6 sm:pt-8 pb-16">
        <div className="mb-6 space-y-2">
          <div className="flex">
            <Badge variant="lemon" tilt="left">
              <span>Quick 60s Creator ✨</span>
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Create Your Friendship Test 💕
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            Pick a starter vibe, lock in your secret true answers, and publish your shareable squad link. 🔗
          </p>
        </div>

        <QuizCreator initialTemplateId={initialTemplateId} />
      </main>
    </div>
  );
}
