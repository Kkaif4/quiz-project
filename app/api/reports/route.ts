import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { Report } from "@/models/Report";
import { CreateReportSchema } from "@/lib/validation";
import {
  quizReportLimiter,
  getClientIp,
  createRateLimitHeaders,
} from "@/lib/rate-limit";
import { validatePayloadSize, isHoneypotTriggered } from "@/lib/security";
import { verifyRecaptchaV3 } from "@/lib/recaptcha";
import { sanitizeText } from "@/lib/sanitize";

export async function POST(request: Request) {
  // 1. Rate limit check (3 req / IP / hour)
  const clientIp = getClientIp(request);
  const rateLimitResult = quizReportLimiter.check(clientIp);
  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Rate limit exceeded. Please wait before submitting another report.",
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

  // 4. Validate with CreateReportSchema
  const validation = CreateReportSchema.safeParse(body);
  if (!validation.success) {
    const errorMessage =
      validation.error.issues[0]?.message || "Invalid report data provided";
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
    "submit_report",
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

    // 5. Resolve quiz by Mongo ObjectId or public code
    const queryConditions: Array<{ _id?: string; code?: string }> = [
      { code: validatedData.quizId },
    ];

    if (isValidObjectId(validatedData.quizId)) {
      queryConditions.unshift({ _id: validatedData.quizId });
    }

    const quiz = await Quiz.findOne({
      $or: queryConditions,
    });

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404, headers: rateLimitHeaders },
      );
    }

    // 6. Sanitize description
    const sanitizedDescription = validatedData.description
      ? sanitizeText(validatedData.description, { maxLength: 500 })
      : "";

    // 7. Save Report document
    await Report.create({
      quizId: quiz._id,
      reason: validatedData.reason,
      description: sanitizedDescription,
      status: "pending",
    });

    // 8. Return 201 response
    return NextResponse.json(
      { success: true, message: "Report submitted successfully" },
      { status: 201, headers: rateLimitHeaders },
    );
  } catch (error) {
    console.error("Report submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit report. Please try again later.",
      },
      { status: 500, headers: rateLimitHeaders },
    );
  }
}
