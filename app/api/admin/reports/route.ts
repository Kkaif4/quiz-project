import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Report } from "@/models/Report";
import { Quiz } from "@/models/Quiz";
import {
  adminApiLimiter,
  getClientIp,
  createRateLimitHeaders,
} from "@/lib/rate-limit";
import {
  verifyAdminSecret,
  validatePayloadSize,
} from "@/lib/security";
import {
  AdminModerateReportSchema,
  AdminReportsQuerySchema,
} from "@/lib/validation";
import type {
  IAdminReportDetails,
  AdminReportsResponse,
} from "@/types/quiz";

/**
 * GET /api/admin/reports
 * 
 * Authenticated endpoint for querying moderation reports with status filtering,
 * pagination, and enriched quiz metadata.
 */
export async function GET(request: Request) {
  // 1. Rate limit check (20 req / IP / 10 min)
  const clientIp = getClientIp(request);
  const rateLimitResult = adminApiLimiter.check(clientIp);
  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded. Please wait before requesting reports again.",
      },
      {
        status: 429,
        headers: rateLimitHeaders,
      },
    );
  }

  // 2. Administrative Secret Verification
  if (!verifyAdminSecret(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Valid administrative key required." },
      { status: 401, headers: rateLimitHeaders },
    );
  }

  // 3. Parse query parameters
  const url = new URL(request.url);
  const queryValidation = AdminReportsQuerySchema.safeParse({
    status: url.searchParams.get("status") ?? "pending",
    page: url.searchParams.get("page") ?? 1,
    limit: url.searchParams.get("limit") ?? 20,
  });

  if (!queryValidation.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid query parameters",
        details: queryValidation.error.format(),
      },
      { status: 400, headers: rateLimitHeaders },
    );
  }

  const { status, page = 1, limit = 20 } = queryValidation.data;

  try {
    await connectToDatabase();

    const filter = status === "all" ? {} : { status };
    const skip = (page - 1) * limit;

    const [total, reports] = await Promise.all([
      Report.countDocuments(filter),
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // 4. Enrich reports with referenced quiz metadata
    const quizIds = Array.from(
      new Set(reports.map((r) => r.quizId.toString())),
    );

    const quizzes = await Quiz.find({ _id: { $in: quizIds } })
      .select("code title status stats questions createdAt")
      .lean();

    const quizMap = new Map<string, (typeof quizzes)[number]>();
    for (const q of quizzes) {
      quizMap.set(q._id.toString(), q);
    }

    const enrichedReports: IAdminReportDetails[] = reports.map((r) => {
      const q = quizMap.get(r.quizId.toString());
      return {
        id: r._id.toString(),
        quizId: r.quizId.toString(),
        reason: r.reason,
        description: r.description,
        status: r.status,
        createdAt: r.createdAt ? r.createdAt.toString() : new Date().toISOString(),
        updatedAt: r.updatedAt ? r.updatedAt.toString() : undefined,
        quiz: q
          ? {
              id: q._id.toString(),
              code: q.code,
              title: q.title,
              status: q.status,
              stats: {
                attempts: q.stats?.attempts ?? 0,
                shares: q.stats?.shares ?? 0,
                views: q.stats?.views ?? 0,
              },
              questionsCount: q.questions?.length ?? 0,
              createdAt: q.createdAt ? q.createdAt.toString() : undefined,
            }
          : null,
      };
    });

    const responseData: AdminReportsResponse = {
      reports: enrichedReports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return NextResponse.json(
      { success: true, data: responseData },
      { status: 200, headers: rateLimitHeaders },
    );
  } catch (error) {
    console.error("Admin reports query error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: rateLimitHeaders },
    );
  }
}

/**
 * PATCH /api/admin/reports
 * 
 * Authenticated endpoint for moderating reported quizzes:
 * - disable_quiz: disables the quiz and marks report resolved
 * - activate_quiz: activates the quiz and marks report resolved
 * - dismiss: marks report reviewed
 * - resolve: marks report resolved
 */
export async function PATCH(request: Request) {
  // 1. Rate limit check (20 req / IP / 10 min)
  const clientIp = getClientIp(request);
  const rateLimitResult = adminApiLimiter.check(clientIp);
  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded. Please wait before executing moderation actions.",
      },
      {
        status: 429,
        headers: rateLimitHeaders,
      },
    );
  }

  // 2. Administrative Secret Verification
  if (!verifyAdminSecret(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Valid administrative key required." },
      { status: 401, headers: rateLimitHeaders },
    );
  }

  // 3. Validate payload size and parse JSON safely
  const payloadResult = await validatePayloadSize(request);
  if (!payloadResult.ok) {
    return payloadResult.response;
  }
  const body = payloadResult.body;

  // 4. Validate with AdminModerateReportSchema
  const validation = AdminModerateReportSchema.safeParse(body);
  if (!validation.success) {
    const errorMessage =
      validation.error.issues[0]?.message || "Invalid moderation payload";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: validation.error.format(),
      },
      { status: 400, headers: rateLimitHeaders },
    );
  }

  const { reportId, action } = validation.data;

  try {
    await connectToDatabase();

    if (!isValidObjectId(reportId)) {
      return NextResponse.json(
        { success: false, error: "Invalid report ID format" },
        { status: 400, headers: rateLimitHeaders },
      );
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404, headers: rateLimitHeaders },
      );
    }

    let quizUpdated = false;
    let quizStatus: string | undefined = undefined;

    switch (action) {
      case "disable_quiz": {
        const quiz = await Quiz.findById(report.quizId);
        if (quiz) {
          quiz.status = "disabled";
          await quiz.save();
          quizUpdated = true;
          quizStatus = quiz.status;
        }
        report.status = "resolved";
        await report.save();
        break;
      }
      case "activate_quiz": {
        const quiz = await Quiz.findById(report.quizId);
        if (quiz) {
          quiz.status = "active";
          await quiz.save();
          quizUpdated = true;
          quizStatus = quiz.status;
        }
        report.status = "resolved";
        await report.save();
        break;
      }
      case "dismiss": {
        report.status = "reviewed";
        await report.save();
        break;
      }
      case "resolve": {
        report.status = "resolved";
        await report.save();
        break;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Action '${action}' applied successfully`,
        data: {
          reportId: report._id.toString(),
          reportStatus: report.status,
          quizUpdated,
          quizStatus,
        },
      },
      { status: 200, headers: rateLimitHeaders },
    );
  } catch (error) {
    console.error("Admin report moderation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: rateLimitHeaders },
    );
  }
}
