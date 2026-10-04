import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { getPublicQuizByCode } from "@/lib/quiz";
import { UpdateQuizStatusSchema } from "@/lib/validation";
import { hashToken } from "@/lib/tokens";

import { validatePayloadSize } from "@/lib/security";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ quizCode: string }> },
) {
  // Await params per Next.js 16 / React 19 standards
  const { quizCode } = await params;

  if (!quizCode || typeof quizCode !== "string") {
    return NextResponse.json(
      { success: false, error: "Invalid quiz code" },
      { status: 400 },
    );
  }

  try {
    const quiz = await getPublicQuizByCode(quizCode, { incrementViews: true });

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found or is no longer active" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: quiz }, { status: 200 });
  } catch (error) {
    console.error("Error fetching public quiz:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
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

  // 1. Validate payload size and parse JSON safely
  const payloadResult = await validatePayloadSize(request);
  if (!payloadResult.ok) {
    return payloadResult.response;
  }
  const body = payloadResult.body;

  // 3. Validate body with UpdateQuizStatusSchema
  const validation = UpdateQuizStatusSchema.safeParse(body);
  if (!validation.success) {
    const errorMessage =
      validation.error.issues[0]?.message || "Invalid status update data";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 },
    );
  }

  try {
    await connectToDatabase();

    const quiz = await Quiz.findOne({ code: quizCode.trim() });
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 },
      );
    }

    // Capability verification: compare hash of raw ownerToken to ownerTokenHash
    if (quiz.ownerTokenHash !== hashToken(validation.data.ownerToken)) {
      return NextResponse.json(
        { success: false, error: "Invalid owner token" },
        { status: 403 },
      );
    }

    quiz.status = validation.data.status;
    await quiz.save();

    return NextResponse.json(
      { success: true, data: { status: quiz.status } },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating quiz status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

