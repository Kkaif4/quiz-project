import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { QuizCreator } from "@/components/quiz/QuizCreator";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PageContainer } from "@/components/layout/PageContainer";
import { Heading, Text } from "@/components/ui/Typography";

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
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col bg-[var(--bg-primary)]">
      {/* Sticky Header Bar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto px-3.5 sm:px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            aria-label="Back to home page"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden xs:inline">Home</span>
          </Link>

          <BrandLogo size={32} textClassName="text-base sm:text-lg" />

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Container with Paper Texture */}
      <PageContainer maxWidth="md" texture="paper" padding="sm" className="pt-5 sm:pt-7">
        <div className="mb-6">
          <div className="pill-badge mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-plum)]" />
            <span>Quick Creator</span>
          </div>
          <Heading level={1} className="text-2xl sm:text-3xl font-black tracking-tight">
            Create Your Friendship Test
          </Heading>
          <Text className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Pick a preset or customize questions. Choose your secret answers, review, and publish your shareable quiz.
          </Text>
        </div>

        <QuizCreator initialTemplateId={initialTemplateId} />
      </PageContainer>
    </div>
  );
}
