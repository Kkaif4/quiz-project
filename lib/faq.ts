export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is LemonQuiz?",
    answer:
      "LemonQuiz is a warm, private friendship quiz and BFF test where you can create a custom 60-second challenge to see how well your friends, besties, and squad really know you.",
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
  }
];
