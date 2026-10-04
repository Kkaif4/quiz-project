/**
 * Dynamic origin resolver for LemonQuiz.
 * Prioritizes explicit application URLs, then Vercel deployment variables,
 * falling back to localhost (development) or lemonquiz.app (production).
 * Strips all trailing slashes to guarantee uniform URL construction.
 */
export function getBaseUrl(): string {
  const explicitUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL;

  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    return "https://lemonquiz.app";
  }

  return "http://localhost:3000";
}
