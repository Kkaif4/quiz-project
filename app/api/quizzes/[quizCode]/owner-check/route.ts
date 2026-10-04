import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { User } from "@/models/User";
import { hashToken } from "@/lib/tokens";
import { OwnerCheckSchema } from "@/lib/validation";
import {
  quizSyncLimiter,
  getClientIp,
  createRateLimitHeaders,
} from "@/lib/rate-limit";
import { validatePayloadSize } from "@/lib/security";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizCode: string }> },
) {
  // Await params per Next.js 16 standards
  const { quizCode } = await params;

  if (!quizCode || typeof quizCode !== "string" || !quizCode.trim()) {
    return NextResponse.json(
      { success: false, error: "Invalid quiz code" },
      { status: 400 },
    );
  }

  // 1. Rate limiting check (30 requests / 10 minutes per IP)
  const clientIp = getClientIp(request);
  const rateLimitResult = quizSyncLimiter.check(clientIp);
  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please wait a moment before checking ownership.",
      },
      {
        status: 429,
        headers: rateLimitHeaders,
      },
    );
  }

  // 2. Validate payload size (<50KB) and parse body safely
  const payloadResult = await validatePayloadSize(request);
  if (!payloadResult.ok) {
    return payloadResult.response;
  }
  const body = payloadResult.body;

  // 3. Schema validation with Zod
  const validation = OwnerCheckSchema.safeParse(body);
  if (!validation.success) {
    const errorMessage =
      validation.error.issues[0]?.message || "Invalid payload";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400, headers: rateLimitHeaders },
    );
  }

  const { tokens, clientFingerprint } = validation.data;

  try {
    await connectToDatabase();

    // 4. Find active quiz
    const quiz = await Quiz.findOne({
      code: quizCode.trim(),
      status: "active",
    })
      .select("ownerTokenHash ownerId")
      .lean();

    if (!quiz || !quiz.ownerTokenHash) {
      return NextResponse.json(
        {
          success: true,
          data: {
            isOwner: false,
            ownerToken: null,
          },
        },
        { status: 200, headers: rateLimitHeaders },
      );
    }

    // 5. Check if any provided candidate token matches
    if (tokens && Array.isArray(tokens) && tokens.length > 0) {
      const matchedToken = tokens.find(
        (token) =>
          typeof token === "string" &&
          token.trim().length > 0 &&
          hashToken(token.trim()) === quiz.ownerTokenHash,
      );

      if (matchedToken) {
        return NextResponse.json(
          {
            success: true,
            data: {
              isOwner: true,
              ownerToken: matchedToken.trim(),
            },
          },
          { status: 200, headers: rateLimitHeaders },
        );
      }
    }

    // 6. If no token match, but clientFingerprint is provided and quiz has an ownerId
    if (clientFingerprint && clientFingerprint.trim() && quiz.ownerId) {
      const user = await User.findOne({
        clientFingerprint: clientFingerprint.trim(),
        _id: quiz.ownerId,
      })
        .select("ownerTokens")
        .lean();

      if (user) {
        const matchedToken = (user.ownerTokens || []).find(
          (token: string) =>
            typeof token === "string" &&
            token.trim().length > 0 &&
            hashToken(token.trim()) === quiz.ownerTokenHash,
        );

        return NextResponse.json(
          {
            success: true,
            data: {
              isOwner: true,
              ownerToken: matchedToken ? matchedToken.trim() : null,
            },
          },
          { status: 200, headers: rateLimitHeaders },
        );
      }
    }

    // 7. Otherwise not recognized as owner
    return NextResponse.json(
      {
        success: true,
        data: {
          isOwner: false,
          ownerToken: null,
        },
      },
      { status: 200, headers: rateLimitHeaders },
    );
  } catch (error) {
    console.error("Error checking quiz ownership:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: rateLimitHeaders },
    );
  }
}
