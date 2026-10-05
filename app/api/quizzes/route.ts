import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { User } from "@/models/User";
import { CreateQuizSchema } from "@/lib/validation";
import {
  generateCode,
  generateOwnerToken,
  hashToken,
  hashIp,
} from "@/lib/tokens";
import {
  quizCreateLimiter,
  getClientIp,
  createRateLimitHeaders,
} from "@/lib/rate-limit";
import { validatePayloadSize, isHoneypotTriggered } from "@/lib/security";
import { verifyRecaptchaV3 } from "@/lib/recaptcha";
import { sanitizeText } from "@/lib/sanitize";
import type { QuizCreationResult } from "@/types/quiz";

export async function POST(request: Request) {
  const reqId = Math.random().toString(36).substring(2, 8);
  console.log(`[QuizCreate:${reqId}] Incoming POST /api/quizzes request`);

  // 1. Rate limit check (5 req / IP / hour)
  const clientIp = getClientIp(request);
  console.log(`[QuizCreate:${reqId}] Client IP: ${clientIp}`);
  const rateLimitResult = quizCreateLimiter.check(clientIp);
  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.success) {
    console.warn(`[QuizCreate:${reqId}] Rate limit exceeded for IP: ${clientIp}`);
    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded. Please wait before creating another quiz.",
      },
      {
        status: 429,
        headers: rateLimitHeaders,
      },
    );
  }
  console.log(`[QuizCreate:${reqId}] Rate limit OK. Remaining: ${rateLimitResult.remaining}`);

  // 2. Validate payload size and parse JSON safely
  const payloadResult = await validatePayloadSize(request);
  if (!payloadResult.ok) {
    console.warn(`[QuizCreate:${reqId}] Payload validation rejected (exceeds size limit)`);
    return payloadResult.response;
  }
  const body = payloadResult.body;
  console.log(`[QuizCreate:${reqId}] Payload received (${JSON.stringify(body).length} bytes)`);

  // 3. Anti-bot honeypot check
  if (isHoneypotTriggered(body)) {
    console.warn(`[QuizCreate:${reqId}] Honeypot triggered by request body`);
    return NextResponse.json(
      { success: false, error: "Bot detected" },
      { status: 400, headers: rateLimitHeaders },
    );
  }

  // 4. Validate with CreateQuizSchema
  const validation = CreateQuizSchema.safeParse(body);
  if (!validation.success) {
    const errorMessage =
      validation.error.issues[0]?.message || "Invalid quiz data provided";
    console.warn(`[QuizCreate:${reqId}] Validation failed:`, validation.error.format());
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: validation.error.format(),
      },
      { status: 400, headers: rateLimitHeaders },
    );
  }

  const validatedData = validation.data;
  console.log(`[QuizCreate:${reqId}] Validation passed. Title: "${validatedData.title}", Questions: ${validatedData.questions.length}`);

  // 4.5 reCAPTCHA v3 verification
  const recaptchaResult = await verifyRecaptchaV3(
    validatedData.recaptchaToken,
    "create_quiz",
    clientIp,
  );
  if (!recaptchaResult.success) {
    console.warn(`[QuizCreate:${reqId}] reCAPTCHA verification rejected:`, recaptchaResult.error);
    return NextResponse.json(
      { success: false, error: recaptchaResult.error || "Security verification failed" },
      { status: 403, headers: rateLimitHeaders },
    );
  }

  // 5. Connect to database
  try {
    console.log(`[QuizCreate:${reqId}] Connecting to MongoDB Atlas...`);
    await connectToDatabase();
    console.log(`[QuizCreate:${reqId}] MongoDB Atlas connected successfully.`);

    // 6. Generate cryptographic identity tokens
    let quizCode = generateCode(8);
    const ownerToken = generateOwnerToken();
    const ownerTokenHash = hashToken(ownerToken);
    console.log(`[QuizCreate:${reqId}] Generated initial quizCode: ${quizCode}`);

    // 7. Sanitize saved strings to protect against XSS and control characters
    const sanitizedTitle = sanitizeText(validatedData.title);
    const sanitizedCreatorName = sanitizeText(validatedData.creatorName);
    const sanitizedDescription = validatedData.description
      ? sanitizeText(validatedData.description)
      : "";
    const sanitizedQuestions = validatedData.questions.map((q) => ({
      id: q.id,
      text: sanitizeText(q.text),
      type: q.type ?? "single",
      options: q.options.map((opt) => ({
        id: opt.id,
        text: sanitizeText(opt.text),
      })),
      correctOptionId: q.correctOptionId,
    }));

    // 8. Associate / Upsert User profile based on browser footprint
    let user = null;
    const clientFingerprint = validatedData.clientFingerprint?.trim() || "";
    const ipHash = hashIp(clientIp);

    try {
      if (clientFingerprint) {
        user = await User.findOneAndUpdate(
          { clientFingerprint },
          {
            $set: {
              name: sanitizedCreatorName,
              ipHash,
              lastSeenAt: new Date(),
              status: "active",
            },
            $addToSet: {
              ownerTokens: ownerToken,
            },
          },
          { returnDocument: "after", upsert: true },
        );
      } else {
        user = await User.create({
          name: sanitizedCreatorName,
          ipHash,
          lastSeenAt: new Date(),
          status: "active",
          ownerTokens: [ownerToken],
        });
      }
    } catch (userErr) {
      console.warn(`[QuizCreate:${reqId}] User profile creation warning:`, userErr);
    }

    // 9. Save Quiz document in MongoDB (direct insert with duplicate index retry)
    console.log(`[QuizCreate:${reqId}] Writing Quiz document to MongoDB...`);
    let createdQuiz = null;
    let retries = 0;

    while (!createdQuiz && retries < 3) {
      try {
        createdQuiz = await Quiz.create({
          code: quizCode,
          ownerTokenHash,
          ownerId: user?._id ?? null,
          title: sanitizedTitle,
          description: sanitizedDescription,
          questions: sanitizedQuestions,
          settings: validatedData.settings,
          stats: {
            attempts: 0,
            shares: 0,
            views: 0,
          },
          status: "active",
        });
      } catch (err: unknown) {
        if (
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          (err as { code: number }).code === 11000 &&
          retries < 2
        ) {
          quizCode = generateCode(8);
          retries++;
        } else {
          throw err;
        }
      }
    }
    console.log(`[QuizCreate:${reqId}] Quiz document saved successfully! DB _id: ${createdQuiz?._id}`);

    // 9. Update quiz_owner_tokens HTTP-only cookie
    let existingTokens: string[] = [];
    try {
      let rawCookie: string | undefined;
      try {
        const cookieStore = await cookies();
        rawCookie = cookieStore.get("quiz_owner_tokens")?.value;
      } catch {
        // Fallback for edge / serverless environments
        const cookieHeader = request.headers.get("cookie") || "";
        const match = cookieHeader.match(/quiz_owner_tokens=([^;]+)/);
        if (match) {
          rawCookie = decodeURIComponent(match[1]);
        }
      }

      if (rawCookie) {
        const parsed = JSON.parse(rawCookie);
        if (Array.isArray(parsed)) {
          existingTokens = parsed.filter(
            (t): t is string => typeof t === "string" && t.length > 0,
          );
        }
      }
    } catch {
      existingTokens = [];
    }

    const updatedTokens = [
      ownerToken,
      ...existingTokens.filter((t) => t !== ownerToken),
    ].slice(0, 50);

    const resultData: QuizCreationResult = {
      quizCode,
      ownerToken,
      manageUrl: `/manage/${ownerToken}`,
      shareUrl: `/q/${quizCode}`,
      user: user
        ? {
            id: user._id.toString(),
            name: user.name,
          }
        : undefined,
    };

    const response = NextResponse.json(
      {
        success: true,
        data: resultData,
      },
      {
        status: 201,
        headers: rateLimitHeaders,
      },
    );

    response.cookies.set("quiz_owner_tokens", JSON.stringify(updatedTokens), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 31536000, // 1 year
      secure: process.env.NODE_ENV === "production",
    });

    console.log(`[QuizCreate:${reqId}] Completed successfully with status 201.`);
    return response;
  } catch (error) {
    const errorDetails =
      error instanceof Error
        ? `${error.name}: ${error.message}${error.stack ? `\nStack: ${error.stack}` : ""}`
        : String(error);
    console.error(`[QuizCreate:${reqId} ERROR]:`, errorDetails);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create quiz. Please try again later.",
        debugError: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: rateLimitHeaders,
      },
    );
  }
}
