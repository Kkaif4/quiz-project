import { WebVitals } from "@/components/seo/WebVitals";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import { getBaseUrl } from "@/lib/seo";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
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
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/brand-lemon-icon.svg", type: "image/svg+xml" },
      { url: "/icon-pwa-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
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
      {
        url: "/og-preview-default.webp",
        width: 1200,
        height: 630,
        alt: "LemonQuiz — Cozy Social Friendship Challenge",
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
      "n5AkShKw4YoZg6t4zt9dWVtyoSMiILKGoXLicsx4RVI",
      "CzY4LArjfmtusUoJx74s6pssE-zwo4UiT_fJvJGoYLQ",
      "CUJwVLOe6GlodleCrDikkTAsHdO-W4cOzrkScyBEN4M",
    ],
  },
  other: {
    "google-adsense-account": "ca-pub-6625500498736052",
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
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${dmSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('lemon_theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&d)){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`,
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6625500498736052"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col relative text-[var(--text-primary)]">
        {/* Web Vitals Performance Monitor (FE Check) */}
        <WebVitals />
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
