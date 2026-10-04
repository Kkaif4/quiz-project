import { NextResponse } from "next/server";
import { IdentifyUserSchema } from "@/lib/validation";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Quiz } from "@/models/Quiz";
import { hashIp, hashToken } from "@/lib/tokens";
import {
  userIdentifyLimiter,
  getClientIp,
  createRateLimitHeaders,
} from "@/lib/rate-limit";
import { validatePayloadSize } from "@/lib/security";

export async function POST(request: Request) {
  // 1. Rate limiting check (30 requests / 10 minutes per IP)
  const clientIp = getClientIp(request);
  const rateLimitResult = userIdentifyLimiter.check(clientIp);
  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please wait a moment before retrying.",
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
  const validation = IdentifyUserSchema.safeParse(body);
  if (!validation.success) {
    const errorMessage =
      validation.error.issues[0]?.message || "Invalid blueprint payload";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400, headers: rateLimitHeaders },
    );
  }

  const { clientFingerprint } = validation.data;
  const ipHash = hashIp(clientIp);

  // 4. Connect to database and lookup user by blueprint
  try {
    await connectToDatabase();

    const user = await User.findOne({
      clientFingerprint,
      status: "active",
    }).lean();

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          data: {
            user: null,
            quizzes: [],
          },
        },
        { status: 200, headers: rateLimitHeaders },
      );
    }

    // 5. Asynchronously refresh lastSeenAt and ipHash (non-blocking)
    User.updateOne(
      { _id: user._id },
      { ipHash, lastSeenAt: new Date() },
    ).catch(console.error);

    // 6. Compute hash map for user.ownerTokens to hydrate raw ownerToken
    const tokenMap = new Map<string, string>();
    (user.ownerTokens || []).forEach((t: string) => {
      if (t && typeof t === "string") {
        const clean = t.trim();
        tokenMap.set(hashToken(clean), clean);
      }
    });

    // 7. Fetch all active quizzes created by this user or matching ownerTokens
    const quizzes = await Quiz.find({
      $or: [
        { ownerId: user._id },
        { ownerTokenHash: { $in: Array.from(tokenMap.keys()) } },
      ],
      status: { $ne: "disabled" },
    })
      .sort({ createdAt: -1 })
      .select("code title status stats ownerTokenHash createdAt")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
          },
          quizzes: quizzes.map((q) => ({
            code: q.code,
            title: q.title,
            status: q.status,
            stats: q.stats,
            ownerToken: tokenMap.get(q.ownerTokenHash) || "",
            createdAt: q.createdAt,
          })),
        },
      },
      { status: 200, headers: rateLimitHeaders },
    );
  } catch (error) {
    console.error("Error identifying user via blueprint:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: rateLimitHeaders },
    );
  }
}
