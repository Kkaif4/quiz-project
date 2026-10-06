import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LemonQuiz — Friendship Quiz & BFF Test 2026",
    short_name: "LemonQuiz",
    description:
      "Create your personalized friendship test in 60 seconds, share with friends, and see who knows you best.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF9F2",
    theme_color: "#6D526F",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-pwa-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
