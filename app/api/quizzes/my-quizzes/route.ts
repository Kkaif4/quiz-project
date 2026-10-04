import { NextResponse } from "next/server";
import { SyncOwnerQuizzesSchema } from "@/lib/validation";
import { getQuizzesByOwnerTokens } from "@/lib/quiz";
import {
  quizSyncLimiter,
  getClientIp,
  createRateLimitHeaders,
} from "@/lib/rate-limit";
import { validatePayloadSize } from "@/lib/security";

export async function POST(request: Request) {
  // 1. Rate limit check (30 req / IP / 10 min)
  const clientIp = getClientIp(request);
  const rateLimitResult = quizSyncLimiter.check(clientIp);
  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded. Please wait before syncing quizzes again.",
      },
      {
        status: 429,
        headers: rateLimitHeaders,
      },
    );
  }

  // 2. Validate payload size and parse JSON safely
  const payloadResult = await validatePayloadSize(request);
  if (!payloadResult.ok) {
    return payloadResult.response;
  }
  const body = payloadResult.body;

  // 3. Validate body with SyncOwnerQuizzesSchema
  const validation = SyncOwnerQuizzesSchema.safeParse(body);
  if (!validation.success) {
    const errorMessage =
      validation.error.issues[0]?.message || "Invalid tokens payload";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400, headers: rateLimitHeaders },
    );
  }

  // 4. Fetch quizzes for owner tokens
  try {
    const quizzes = await getQuizzesByOwnerTokens(validation.data.tokens);
    return NextResponse.json(
      { success: true, data: quizzes },
      { status: 200, headers: rateLimitHeaders },
    );
  } catch (error) {
    console.error("Error retrieving owner quizzes:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: rateLimitHeaders },
    );
  }
}
