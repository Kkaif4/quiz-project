import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl =
  process.env.APP_URL || "https://lemon-quiz-maniac.kkaifshaikh-27.workers.dev";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "LemonQuiz — How Well Do Your Friends Really Know You?",
    template: "%s | LemonQuiz",
  },
  description:
    "Create your personalized friendship test in 60 seconds, share with friends, and see who knows you best.",
  icons: {
    icon: "/browser-icon.png",
    apple: "/browser-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "LemonQuiz",
    title: "LemonQuiz — How Well Do Your Friends Really Know You?",
    description:
      "Create your personalized friendship test in 60 seconds, share with friends, and see who knows you best.",
    images: [
      {
        url: "/api/og?type=home",
        width: 1200,
        height: 630,
        alt: "LemonQuiz — How Well Do Your Friends Really Know You?",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LemonQuiz — How Well Do Your Friends Really Know You?",
    description:
      "Create your personalized friendship test in 60 seconds, share with friends, and see who knows you best.",
    images: ["/api/og?type=home"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative text-[var(--text-primary)]">
        {/* Fixed Non-Scrolling Branded Background with Overlay */}
        <div aria-hidden="true" className="bg-ambient-backdrop">
          <div className="bg-ambient-image" />
          <div className="bg-ambient-overlay" />
        </div>
        {children}
      </body>
    </html>
  );
}
