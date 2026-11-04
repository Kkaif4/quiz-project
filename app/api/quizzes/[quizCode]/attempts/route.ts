import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { Attempt } from "@/models/Attempt";
import { SubmitAttemptSchema } from "@/lib/validation";
import { generateCode, hashIp } from "@/lib/tokens";
import {
  quizAttemptLimiter,
  getClientIp,
  createRateLimitHeaders,
} from "@/lib/rate-limit";
import { validatePayloadSize, isHoneypotTriggered } from "@/lib/security";
import { verifyRecaptchaV3 } from "@/lib/recaptcha";
import { sanitizeText } from "@/lib/sanitize";
import type { AttemptSubmissionResult } from "@/types/quiz";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizCode: string }> },
) {
  // Await params per Next.js 16 standards
  const { quizCode } = await params;

  if (!quizCode || typeof quizCode !== "string") {
    return NextResponse.json(
      { success: false, error: "Invalid quiz code" },
      { status: 400 },
    );
  }

  // 1. Rate limit check (10 req / IP / 10 minutes)
  const clientIp = getClientIp(request);
  const rateLimitResult = quizAttemptLimiter.check(clientIp);
  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Rate limit exceeded. Please wait a few minutes before submitting another attempt.",
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

  // 3. Anti-bot honeypot check
  if (isHoneypotTriggered(body)) {
    return NextResponse.json(
      { success: false, error: "Bot detected" },
      { status: 400, headers: rateLimitHeaders },
    );
  }

  // 4. Validate with SubmitAttemptSchema (enforces >=3s timing, nickname 1-30, etc.)
  const validation = SubmitAttemptSchema.safeParse(body);
  if (!validation.success) {
    const errorMessage =
      validation.error.issues[0]?.message || "Invalid attempt submission";
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

  // 4.5 reCAPTCHA v3 verification
  const recaptchaResult = await verifyRecaptchaV3(
    validatedData.recaptchaToken,
    "submit_attempt",
    clientIp,
  );
  if (!recaptchaResult.success) {
    return NextResponse.json(
      { success: false, error: recaptchaResult.error || "Security verification failed" },
      { status: 403, headers: rateLimitHeaders },
    );
  }

  try {
    await connectToDatabase();

    // 5. Load authoritative quiz with lean projection
    const quiz = await Quiz.findOne({
      code: quizCode.trim(),
      status: "active",
    })
      .select("questions settings _id code status")
      .lean();

    if (!quiz) {
      return NextResponse.json(
        {
          success: false,
          error: "Quiz not found or is no longer active",
        },
        { status: 404, headers: rateLimitHeaders },
      );
    }

    // 6. Check maxAttemptsPerPerson constraint
    const ipHash = hashIp(clientIp);
    const maxAttempts = quiz.settings?.maxAttemptsPerPerson ?? 3;

    const existingAttemptsCount = await Attempt.countDocuments({
      quizId: quiz._id,
      "metadata.ipHash": ipHash,
    });

    if (existingAttemptsCount >= maxAttempts) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You have reached the maximum number of attempts allowed for this quiz.",
        },
        { status: 403, headers: rateLimitHeaders },
      );
    }

    // 7. Calculate score and percentage strictly on the server
    const total = quiz.questions.length;
    const questionMap = new Map<
      string,
      { correctOptionId: string; validOptionIds: Set<string> }
    >();

    for (const q of quiz.questions) {
      questionMap.set(q.id, {
        correctOptionId: q.correctOptionId,
        validOptionIds: new Set(q.options.map((opt) => opt.id)),
      });
    }

    let score = 0;
    for (const answer of validatedData.answers) {
      const q = questionMap.get(answer.questionId);
      if (!q || !q.validOptionIds.has(answer.optionId)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid questionId or optionId provided in answers",
          },
          { status: 400, headers: rateLimitHeaders },
        );
      }

      // Match against authoritative correctOptionId
      if (answer.optionId === q.correctOptionId) {
        score++;
      }
    }

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    // 8. Generate attemptCode and insert directly (with duplicate index collision retry)
    let attemptCode = generateCode(8);
    const userAgent = request.headers.get("user-agent") || null;
    const sanitizedNickname = sanitizeText(validatedData.nickname);

    let created = false;
    let retries = 0;

    while (!created && retries < 3) {
      try {
        await Attempt.create({
          code: attemptCode,
          quizId: quiz._id,
          nickname: sanitizedNickname,
          answers: validatedData.answers,
          score,
          total,
          percentage,
          metadata: {
            userAgent,
            ipHash,
          },
        });
        created = true;
      } catch (err: unknown) {
        if (
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          (err as { code: number }).code === 11000 &&
          retries < 2
        ) {
          attemptCode = generateCode(8);
          retries++;
        } else {
          throw err;
        }
      }
    }

    // 9. Fire-and-forget non-blocking quiz stats increment
    Quiz.updateOne(
      { _id: quiz._id },
      { $inc: { "stats.attempts": 1 } },
    ).catch((err) => {
      console.error("Failed to increment quiz attempts stat:", err);
    });

    // 10. Return response matching AttemptSubmissionResult
    const result: AttemptSubmissionResult = {
      attemptCode,
      nickname: sanitizedNickname,
      score,
      total,
      percentage,
      quizCode,
    };

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        status: 201,
        headers: rateLimitHeaders,
      },
    );
  } catch (error) {
    console.error("Attempt submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit quiz attempt. Please try again later.",
      },
      {
        status: 500,
        headers: rateLimitHeaders,
      },
    );
  }
}
