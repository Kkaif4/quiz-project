import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getBaseUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "LemonQuiz — The #1 Friendship Quiz & BFF Test 2026",
    template: "%s | LemonQuiz",
  },
  description:
    "Create your personalized friendship test in 60 seconds, share with friends, and see who knows you best.",
  keywords: [
    "friendship quiz",
    "bff test 2026",
    "how well do your friends know you",
    "best friend quiz",
    "buddy meter",
    "dare quiz 2026",
    "trivia for friends",
  ],
  authors: [{ name: "LemonQuiz" }],
  creator: "LemonQuiz",
  publisher: "LemonQuiz",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/browser-icon.png",
    apple: "/browser-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "LemonQuiz",
    title: "LemonQuiz — The #1 Friendship Quiz & BFF Test 2026",
    description:
      "Create your personalized friendship test in 60 seconds, share with friends, and see who knows you best.",
    images: [
      {
        url: "/api/og?type=home",
        width: 1200,
        height: 630,
        alt: "LemonQuiz — The #1 Friendship Quiz & BFF Test 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LemonQuiz — The #1 Friendship Quiz & BFF Test 2026",
    description:
      "Create your personalized friendship test in 60 seconds, share with friends, and see who knows you best.",
    images: ["/api/og?type=home"],
  },
  verification: {
    google: [
      "CzY4LArjfmtusUoJx74s6pssE-zwo4UiT_fJvJGoYLQ",
      "CUJwVLOe6GlodleCrDikkTAsHdO-W4cOzrkScyBEN4M",
    ],
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
