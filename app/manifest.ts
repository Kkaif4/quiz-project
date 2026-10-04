import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LemonQuiz — Friendship Quiz & BFF Test 2026",
    short_name: "LemonQuiz",
    description:
      "Create your personalized friendship test in 60 seconds, share with friends, and see who knows you best.",
    start_url: "/",
    display: "standalone",
    background_color: "#080816",
    theme_color: "#8B5CF6",
    orientation: "portrait",
    icons: [
      {
        src: "/browser-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
