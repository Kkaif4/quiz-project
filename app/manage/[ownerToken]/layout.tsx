import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner Dashboard — LemonQuiz",
  robots: { index: false, follow: false, noarchive: true },
};

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
