import type { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { getBaseUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/create`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  try {
    await connectToDatabase();
    const quizzes = await Quiz.find({ status: "active" })
      .select("code updatedAt createdAt")
      .sort({ updatedAt: -1 })
      .limit(10000)
      .lean();

    const quizRoutes: MetadataRoute.Sitemap = quizzes.map((quiz) => ({
      url: `${baseUrl}/q/${quiz.code}`,
      lastModified: quiz.updatedAt || quiz.createdAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...quizRoutes];
  } catch (error) {
    console.warn(
      "Dynamic sitemap generation: Database unavailable or offline CI build. Falling back to static routes.",
      error,
    );
    return staticRoutes;
  }
}
