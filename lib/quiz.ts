import { cache } from "react";
import type { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { Attempt } from "@/models/Attempt";
import { hashToken } from "@/lib/tokens";
import type {
  IQuizPublic,
  IAttemptResultDetails,
  IOwnerQuizDetails,
  IOwnerAttemptHistory,
  ILeaderboardEntry,
  IUserQuizSummary,
} from "@/types/quiz";

export interface GetPublicQuizOptions {
  incrementViews?: boolean;
}

/**
 * Internal cached query to load public quiz data by code.
 * React.cache deduplicates calls between generateMetadata and Page components.
 */
const fetchPublicQuizByCode = cache(
  async (code: string): Promise<IQuizPublic | null> => {
    if (!code || typeof code !== "string") {
      return null;
    }

    await connectToDatabase();

    const quiz = await Quiz.findOne({
      code: code.trim(),
      status: "active",
    })
      .select("-ownerTokenHash -questions.correctOptionId")
      .lean();

    if (!quiz) {
      return null;
    }

    // Explicit manual mapping to guarantee zero leak of internal or sensitive fields
    const safeQuiz: IQuizPublic = {
      code: quiz.code,
      title: quiz.title,
      description: quiz.description ?? "",
      questions: quiz.questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type ?? "single",
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
        })),
      })),
      settings: {
        showScore: quiz.settings?.showScore ?? true,
        showCorrectAnswers: quiz.settings?.showCorrectAnswers ?? false,
        maxAttemptsPerPerson: quiz.settings?.maxAttemptsPerPerson ?? 1,
      },
      stats: {
        attempts: quiz.stats?.attempts ?? 0,
        shares: quiz.stats?.shares ?? 0,
        views: quiz.stats?.views ?? 0,
      },
      status: quiz.status,
      createdAt: quiz.createdAt,
    };

    return safeQuiz;
  },
);

/**
 * Loads a public quiz by its unique code with strict answer key and token sanitization.
 * Memoized via React.cache() per server request.
 *
 * CRITICAL SECURITY INVARIANT:
 * Zero Answer Key Leakage. The fields `ownerTokenHash` and `questions.correctOptionId`
 * are NEVER returned in the public object.
 */
export const getPublicQuizByCode = cache(
  async (
    code: string,
    options?: GetPublicQuizOptions,
  ): Promise<IQuizPublic | null> => {
    if (!code || typeof code !== "string") {
      return null;
    }

    const quiz = await fetchPublicQuizByCode(code.trim());
    if (!quiz) {
      return null;
    }

    if (options?.incrementViews) {
      // Fire-and-forget non-blocking view counter increment
      Quiz.updateOne(
        { code: quiz.code },
        { $inc: { "stats.views": 1 } },
      ).catch((err) => {
        console.error("Failed to increment quiz views:", err);
      });
    }

    return quiz;
  },
);

/**
 * Loads an attempt result safely by quizCode and attemptCode.
 * Memoized via React.cache() per server request to deduplicate calls
 * between generateMetadata and ResultPage.
 *
 * CRITICAL PRIVACY & SECURITY:
 * Never returns answer key, ipHash, or owner secret tokens.
 */
export const getAttemptResultByCode = cache(
  async (
    quizCode: string,
    attemptCode: string,
  ): Promise<IAttemptResultDetails | null> => {
    if (
      !quizCode ||
      typeof quizCode !== "string" ||
      !attemptCode ||
      typeof attemptCode !== "string"
    ) {
      return null;
    }

    await connectToDatabase();

    const attempt = await Attempt.findOne({
      code: attemptCode.trim(),
    }).lean();

    if (!attempt) {
      return null;
    }

    const quiz = await Quiz.findOne({
      _id: attempt.quizId,
      code: quizCode.trim(),
    })
      .select("title code status")
      .lean();

    if (!quiz) {
      return null;
    }

    return {
      attemptCode: attempt.code,
      quizCode: quiz.code,
      quizTitle: quiz.title,
      nickname: attempt.nickname,
      score: attempt.score,
      total: attempt.total,
      percentage: attempt.percentage,
      createdAt: attempt.createdAt ? attempt.createdAt.toString() : new Date().toISOString(),
    };
  },
);

/**
 * Loads an owner's quiz by their raw capability token.
 * Hashes token with SHA-256 for secure database lookup.
 * Memoized via React.cache() per server request to deduplicate calls
 * between generateMetadata and ManagePage.
 *
 * NOTE: The owner is authorized to review questions and answers,
 * so correctOptionId is retained, while ownerTokenHash is omitted.
 */
export const getOwnerQuizByToken = cache(
  async (rawToken: string): Promise<IOwnerQuizDetails | null> => {
    if (!rawToken || typeof rawToken !== "string") {
      return null;
    }

    await connectToDatabase();

    const hashedToken = hashToken(rawToken.trim());
    const quiz = await Quiz.findOne({ ownerTokenHash: hashedToken }).lean();

    if (!quiz) {
      return null;
    }

    return {
      _id: quiz._id,
      code: quiz.code,
      title: quiz.title,
      description: quiz.description ?? "",
      status: quiz.status,
      stats: {
        attempts: quiz.stats?.attempts ?? 0,
        shares: quiz.stats?.shares ?? 0,
        views: quiz.stats?.views ?? 0,
      },
      questions: quiz.questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type ?? "single",
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
        })),
        correctOptionId: q.correctOptionId,
      })),
      createdAt: quiz.createdAt ?? new Date(),
    };
  },
);

/**
 * Loads leaderboard and chronological attempt history for a quiz owner dashboard.
 * Calculates the overall average score percentage across attempts.
 */
export async function getQuizAttemptsForOwner(
  quizId: string | Types.ObjectId,
): Promise<{
  leaderboard: ILeaderboardEntry[];
  history: IOwnerAttemptHistory[];
  averageScore: number;
}> {
  if (!quizId) {
    return { leaderboard: [], history: [], averageScore: 0 };
  }

  await connectToDatabase();

  const [rawLeaderboard, rawHistory] = await Promise.all([
    Attempt.find({ quizId })
      .sort({ score: -1, createdAt: -1 })
      .limit(50)
      .select("code nickname score total percentage createdAt")
      .lean(),
    Attempt.find({ quizId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("code nickname score total percentage answers createdAt")
      .lean(),
  ]);

  const leaderboard: ILeaderboardEntry[] = rawLeaderboard.map((item) => ({
    code: item.code,
    nickname: item.nickname,
    score: item.score,
    total: item.total,
    percentage: item.percentage,
    createdAt: item.createdAt ?? new Date(),
  }));

  const history: IOwnerAttemptHistory[] = rawHistory.map((item) => ({
    code: item.code,
    nickname: item.nickname,
    score: item.score,
    total: item.total,
    percentage: item.percentage,
    answers: (item.answers || []).map((a) => ({
      questionId: a.questionId,
      optionId: a.optionId,
    })),
    createdAt: item.createdAt ?? new Date(),
  }));

  const averageScore =
    history.length > 0
      ? Math.round(
          history.reduce((sum, item) => sum + item.percentage, 0) /
            history.length,
        )
      : 0;

  return {
    leaderboard,
    history,
    averageScore,
  };
}

/**
 * Loads a summary list of quizzes for multiple owner tokens.
 * Maps back each quiz to its raw owner token without exposing ownerTokenHash.
 */
export async function getQuizzesByOwnerTokens(
  tokens: string[],
): Promise<IUserQuizSummary[]> {
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    return [];
  }

  await connectToDatabase();

  const tokenMap = new Map<string, string>();
  for (const raw of tokens) {
    if (typeof raw === "string" && raw.trim().length > 0) {
      const clean = raw.trim();
      tokenMap.set(hashToken(clean), clean);
    }
  }

  const hashes = Array.from(tokenMap.keys());
  if (hashes.length === 0) {
    return [];
  }

  const quizzes = await Quiz.find({ ownerTokenHash: { $in: hashes } })
    .select("code title status stats createdAt ownerTokenHash")
    .sort({ createdAt: -1 })
    .lean();

  return quizzes.map((quiz) => ({
    code: quiz.code,
    title: quiz.title,
    status: quiz.status,
    stats: {
      attempts: quiz.stats?.attempts ?? 0,
      shares: quiz.stats?.shares ?? 0,
      views: quiz.stats?.views ?? 0,
    },
    ownerToken: tokenMap.get(quiz.ownerTokenHash) || "",
    createdAt: quiz.createdAt ?? new Date(),
  }));
}

/**
 * Checks candidate owner tokens against a quiz by code.
 * If one of the candidate tokens hashes to the quiz's ownerTokenHash, returns the matching raw token.
 */
export async function getMatchingOwnerToken(
  quizCode: string,
  candidateTokens: string[],
): Promise<string | null> {
  if (
    !quizCode ||
    typeof quizCode !== "string" ||
    !Array.isArray(candidateTokens) ||
    candidateTokens.length === 0
  ) {
    return null;
  }

  await connectToDatabase();

  const tokenMap = new Map<string, string>();
  for (const raw of candidateTokens) {
    if (typeof raw === "string" && raw.trim().length > 0) {
      const clean = raw.trim();
      tokenMap.set(hashToken(clean), clean);
    }
  }

  const hashes = Array.from(tokenMap.keys());
  if (hashes.length === 0) {
    return null;
  }

  const quiz = await Quiz.findOne({
    code: quizCode.trim(),
    ownerTokenHash: { $in: hashes },
  })
    .select("ownerTokenHash")
    .lean();

  if (!quiz || !quiz.ownerTokenHash) {
    return null;
  }

  return tokenMap.get(quiz.ownerTokenHash) || null;
}

