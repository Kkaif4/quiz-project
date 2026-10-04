import type { Types } from "mongoose";

/**
 * Question format type. MVP exclusively supports single choice,
 * but the type hierarchy accommodates future multimodal questions.
 */
export type QuizQuestionType =
  | "single"
  | "multiple"
  | "text"
  | "image"
  | "rating"
  | "slider";

export type QuizStatus = "active" | "disabled";

export interface IQuizOption {
  id: string;
  text: string;
}

/**
 * Internal Quiz Question representation.
 * Contains the authoritative answer key (correctOptionId).
 * NEVER transmit this interface to client players.
 */
export interface IQuizQuestion {
  id: string;
  text: string;
  type: "single" | QuizQuestionType;
  options: IQuizOption[];
  /** Authoritative correct option identifier. CRITICAL: Server-side only. */
  correctOptionId: string;
}

/**
 * Public Quiz Question representation.
 * Explicitly excludes the answer key to prevent client-side inspection.
 */
export interface IQuizQuestionPublic {
  id: string;
  text: string;
  type: "single" | QuizQuestionType;
  options: IQuizOption[];
}

export interface IQuizSettings {
  showScore: boolean;
  showCorrectAnswers: boolean;
  maxAttemptsPerPerson: number;
}

export interface IQuizStats {
  attempts: number;
  shares: number;
  views: number;
}

/**
 * Authoritative Mongoose Quiz Document Interface.
 */
export interface IQuiz {
  _id?: Types.ObjectId | string;
  code: string;
  ownerTokenHash: string;
  ownerId?: Types.ObjectId | string | null;
  title: string;
  description?: string;
  questions: IQuizQuestion[];
  settings: IQuizSettings;
  stats: IQuizStats;
  status: QuizStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Safe public projection for players taking a quiz.
 * ownerTokenHash and correctOptionId are guaranteed stripped.
 */
export interface IQuizPublic {
  code: string;
  title: string;
  description: string;
  questions: IQuizQuestionPublic[];
  settings: {
    showScore: boolean;
    showCorrectAnswers: boolean;
    maxAttemptsPerPerson: number;
  };
  stats: {
    attempts: number;
    shares: number;
    views: number;
  };
  status: QuizStatus;
  createdAt?: Date | string;
}

export interface IAttemptAnswer {
  questionId: string;
  optionId: string;
}

export interface IAttemptMetadata {
  userAgent?: string | null;
  ipHash?: string | null;
}

/**
 * Authoritative Mongoose Attempt Document Interface.
 * Contains denormalized score and percentage for high-speed queries.
 */
export interface IAttempt {
  _id?: Types.ObjectId | string;
  code: string;
  quizId: Types.ObjectId | string;
  nickname: string;
  answers: IAttemptAnswer[];
  score: number;
  total: number;
  percentage: number;
  metadata?: IAttemptMetadata;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Safe public representation for leaderboard display.
 */
export interface ILeaderboardEntry {
  code: string;
  nickname: string;
  score: number;
  total: number;
  percentage: number;
  createdAt: Date | string;
}

export type ReportReason =
  | "spam"
  | "harassment"
  | "sexual"
  | "hate"
  | "impersonation"
  | "other";

export type ReportStatus = "pending" | "reviewed" | "resolved";

/**
 * Content moderation report document interface.
 */
export interface IReport {
  _id?: Types.ObjectId | string;
  quizId: Types.ObjectId | string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type UserStatus = "active" | "suspended";

/**
 * Placeholder user model interface for post-MVP account linking.
 */
export interface IUser {
  _id?: Types.ObjectId | string;
  name?: string;
  username?: string;
  email?: string;
  image?: string | null;
  status: UserStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Request and response contract interfaces
export interface CreateQuizInput {
  title: string;
  description?: string;
  questions: {
    id: string;
    text: string;
    type?: "single";
    options: {
      id: string;
      text: string;
    }[];
    correctOptionId: string;
  }[];
  settings?: Partial<IQuizSettings>;
  website?: string; // Anti-bot honeypot
}

export interface SubmitAttemptInput {
  nickname: string;
  answers: {
    questionId: string;
    optionId: string;
  }[];
  durationSeconds: number;
  website?: string; // Anti-bot honeypot
}

export interface CreateReportInput {
  quizId: string;
  reason: ReportReason;
  description?: string;
  website?: string; // Anti-bot honeypot
}

export interface QuizCreationResult {
  quizCode: string;
  ownerToken: string;
  manageUrl: string;
  shareUrl: string;
}

export interface AttemptSubmissionResult {
  attemptCode: string;
  nickname: string;
  score: number;
  total: number;
  percentage: number;
  quizCode: string;
}

export interface IAttemptResultDetails {
  attemptCode: string;
  quizCode: string;
  quizTitle: string;
  nickname: string;
  score: number;
  total: number;
  percentage: number;
  createdAt: Date | string;
}

/**
 * Detailed quiz representation for the verified owner dashboard.
 * Includes question details with correctOptionId for owner review,
 * but omits ownerTokenHash.
 */
export interface IOwnerQuizDetails {
  _id?: Types.ObjectId | string;
  code: string;
  title: string;
  description: string;
  status: QuizStatus;
  stats: IQuizStats;
  questions: IQuizQuestion[];
  createdAt: Date | string;
}

/**
 * Detailed attempt history entry for the owner dashboard.
 */
export interface IOwnerAttemptHistory {
  code: string;
  nickname: string;
  score: number;
  total: number;
  percentage: number;
  answers: IAttemptAnswer[];
  createdAt: Date | string;
}

/**
 * Aggregated data package for the owner dashboard view.
 */
export interface IOwnerDashboardData {
  quiz: IOwnerQuizDetails;
  leaderboard: ILeaderboardEntry[];
  history: IOwnerAttemptHistory[];
  averageScore: number;
}

/**
 * Lightweight summary of an owned quiz for multi-quiz hubs ("My Quizzes").
 */
export interface IUserQuizSummary {
  code: string;
  title: string;
  status: QuizStatus;
  stats: IQuizStats;
  ownerToken: string;
  createdAt: Date | string;
}

export interface UpdateQuizStatusInput {
  ownerToken: string;
  status: QuizStatus;
}

export interface SyncOwnerQuizzesInput {
  tokens: string[];
}

export type AdminModerationAction =
  | "disable_quiz"
  | "activate_quiz"
  | "dismiss"
  | "resolve";

export interface IAdminReportDetails {
  id: string;
  quizId: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: Date | string;
  updatedAt?: Date | string;
  quiz?: {
    id: string;
    code: string;
    title: string;
    status: QuizStatus;
    stats: IQuizStats;
    questionsCount: number;
    createdAt?: Date | string;
  } | null;
}

export interface AdminModerateReportInput {
  reportId: string;
  action: AdminModerationAction;
}

export interface AdminReportsResponse {
  reports: IAdminReportDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}



