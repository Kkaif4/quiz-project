import React from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is LemonQuiz?",
    answer:
      "LemonQuiz is a fast, free friendship quiz and BFF test where you can create a custom 60-second challenge to see how well your friends, besties, and squad really know you.",
  },
  {
    question: "How do I create a friendship test?",
    answer:
      "Click 'Create Quiz', pick fun preset questions or write your own custom questions, choose your secret answers, and share your unique quiz link on WhatsApp or Instagram.",
  },
  {
    question: "Do my friends need an account or app to play?",
    answer:
      "No! LemonQuiz requires zero login, zero downloads, and zero passwords. Friends can open your link in any mobile browser, enter a nickname, and submit answers in seconds.",
  },
  {
    question: "How do I check my live leaderboard and scores?",
    answer:
      "When you create a quiz, you receive a private Owner Dashboard link. Your dashboard features a live real-time leaderboard showing friend rankings, scores, and question breakdowns.",
  },
  {
    question: "Is LemonQuiz safe and private?",
    answer:
      "Yes! LemonQuiz collects zero personal data, phone numbers, or email addresses. Scoring is computed server-side to prevent cheating, and inappropriate content can be reported with one click.",
  },
];

/**
 * Accessible FAQ Accordion Server Component using native <details> and <summary>.
 * Strictly avoids system emojis and enforces a >=56px touch target.
 */
export function FaqSection() {
  return (
    <section className="space-y-6 pt-4 max-w-2xl mx-auto w-full">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold shadow-xs">
          <HelpCircle className="w-3.5 h-3.5 text-violet-400" />
          <span>Got Questions?</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] max-w-md mx-auto">
          Everything you need to know about creating, sharing, and playing
          LemonQuiz with your squad.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        {FAQ_ITEMS.map((item, index) => (
          <details
            key={index}
            className="group card-surface rounded-2xl border border-[var(--card-border)] overflow-hidden transition-all duration-200 open:border-violet-500/40 glow-purple"
          >
            <summary className="flex items-center justify-between gap-4 p-4 sm:p-5 min-h-[56px] cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
              <span className="font-bold text-sm sm:text-base text-[var(--text-primary)] text-left leading-snug">
                {item.question}
              </span>
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0 text-violet-300 transition-transform duration-200 group-open:rotate-180">
                <ChevronDown className="w-4 h-4" />
              </div>
            </summary>
            <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)]/40">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
