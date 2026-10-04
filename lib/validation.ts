import { z } from "zod";
import { containsProfanity } from "@/lib/sanitize";

/**
 * Zod schema for an individual option within a question.
 */
export const QuizOptionSchema = z.object({
  id: z.string().trim().min(1, "Option ID is required").max(64),
  text: z
    .string()
    .trim()
    .min(1, "Option text cannot be empty")
    .max(100, "Option text must not exceed 100 characters")
    .refine((v) => !containsProfanity(v), "Text contains inappropriate language"),
});

/**
 * Zod schema for a quiz question with relational validation:
 * - 2 to 6 options per question.
 * - Unique option IDs within the question.
 * - correctOptionId must reference an existing option ID in the options list.
 */
export const QuizQuestionSchema = z
  .object({
    id: z.string().trim().min(1, "Question ID is required").max(64),
    text: z
      .string()
      .trim()
      .min(1, "Question text cannot be empty")
      .max(300, "Question text must not exceed 300 characters")
      .refine((v) => !containsProfanity(v), "Text contains inappropriate language"),
    type: z.literal("single").default("single"),
    options: z
      .array(QuizOptionSchema)
      .min(2, "Each question must have at least 2 options")
      .max(6, "Each question cannot have more than 6 options")
      .refine(
        (options) => {
          const ids = options.map((opt) => opt.id);
          return new Set(ids).size === ids.length;
        },
        { message: "Option IDs within a question must be unique" },
      ),
    correctOptionId: z
      .string()
      .trim()
      .min(1, "Correct option ID is required"),
  })
  .refine(
    (question) =>
      question.options.some((opt) => opt.id === question.correctOptionId),
    {
      message:
        "correctOptionId must match one of the available option IDs in the question",
      path: ["correctOptionId"],
    },
  );

export const QuizSettingsSchema = z.object({
  showScore: z.boolean().default(true),
  showCorrectAnswers: z.boolean().default(false),
  maxAttemptsPerPerson: z.number().int().min(1).max(10).default(1),
});

/**
 * Zod schema for creating a new quiz (POST /api/quizzes).
 * Invariants enforced:
 * - Title: 1 to 100 characters.
 * - Description: max 300 characters.
 * - Questions: 3 to 15 questions.
 * - Question IDs must be unique within the quiz.
 * - Anti-bot honeypot: `website` must be empty or omitted.
 */
export const CreateQuizSchema = z.object({
  creatorName: z
    .string()
    .trim()
    .min(1, "Creator name is required")
    .max(50, "Creator name must not exceed 50 characters")
    .refine((v) => !containsProfanity(v), "Name contains inappropriate language"),
  clientFingerprint: z.string().trim().max(64).optional(),
  title: z
    .string()
    .trim()
    .min(1, "Quiz title is required")
    .max(100, "Quiz title must not exceed 100 characters")
    .refine((v) => !containsProfanity(v), "Text contains inappropriate language"),
  description: z
    .string()
    .trim()
    .max(300, "Description must not exceed 300 characters")
    .default("")
    .optional()
    .refine(
      (v) => !v || !containsProfanity(v),
      "Text contains inappropriate language",
    ),
  questions: z
    .array(QuizQuestionSchema)
    .min(3, "Quiz must contain at least 3 questions")
    .max(15, "Quiz cannot contain more than 15 questions")
    .refine(
      (questions) => {
        const ids = questions.map((q) => q.id);
        return new Set(ids).size === ids.length;
      },
      { message: "Question IDs within a quiz must be unique" },
    ),
  settings: QuizSettingsSchema.default({
    showScore: true,
    showCorrectAnswers: false,
    maxAttemptsPerPerson: 1,
  }),
  website: z.string().max(0, "Bot detected").optional().nullable(),
});

export const AttemptAnswerInputSchema = z.object({
  questionId: z.string().trim().min(1, "Question ID is required"),
  optionId: z.string().trim().min(1, "Option ID is required"),
});

/**
 * Zod schema for submitting a quiz attempt (POST /api/quizzes/[quizCode]/attempts).
 * Invariants enforced:
 * - Nickname: 1 to 30 characters.
 * - Answers: 1 to 15 answers with no duplicate question IDs.
 * - Anti-bot honeypot: `website` must be empty or omitted.
 */
export const SubmitAttemptSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, "Nickname is required")
    .max(30, "Nickname cannot exceed 30 characters")
    .refine((v) => !containsProfanity(v), "Text contains inappropriate language"),
  answers: z
    .array(AttemptAnswerInputSchema)
    .min(1, "At least one answer must be submitted")
    .max(15, "Cannot submit more answers than maximum questions")
    .refine(
      (answers) => {
        const qIds = answers.map((a) => a.questionId);
        return new Set(qIds).size === qIds.length;
      },
      { message: "Duplicate answers for the same question are not permitted" },
    ),
  durationSeconds: z
    .number()
    .min(3, "Attempt completed impossibly fast"),
  website: z.string().max(0, "Bot detected").optional().nullable(),
});

export const ReportReasonEnum = z.enum([
  "spam",
  "harassment",
  "sexual",
  "hate",
  "impersonation",
  "other",
]);

/**
 * Zod schema for submitting an abuse report (POST /api/reports).
 */
export const CreateReportSchema = z.object({
  quizId: z.string().trim().min(1, "Quiz ID is required"),
  reason: ReportReasonEnum,
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .default("")
    .optional(),
  website: z.string().max(0, "Bot detected").optional().nullable(),
});

export type CreateQuizInputSchemaType = z.infer<typeof CreateQuizSchema>;
export type SubmitAttemptInputSchemaType = z.infer<typeof SubmitAttemptSchema>;
export type CreateReportInputSchemaType = z.infer<typeof CreateReportSchema>;

/**
 * Zod schema for owner toggling quiz status (active vs disabled).
 */
export const UpdateQuizStatusSchema = z.object({
  ownerToken: z.string().trim().min(1, "Owner token is required"),
  status: z.enum(["active", "disabled"]),
});

/**
 * Zod schema for syncing/retrieving quizzes associated with owner tokens.
 */
export const SyncOwnerQuizzesSchema = z.object({
  tokens: z.array(z.string().trim().min(1, "Token cannot be empty")).max(50, "Cannot sync more than 50 tokens"),
});

export type UpdateQuizStatusInputSchemaType = z.infer<typeof UpdateQuizStatusSchema>;
export type SyncOwnerQuizzesSchemaType = z.infer<typeof SyncOwnerQuizzesSchema>;

/**
 * Zod schema for administrative report moderation actions.
 */
export const AdminModerateReportSchema = z.object({
  reportId: z.string().trim().min(1, "Report ID is required"),
  action: z.enum(["disable_quiz", "activate_quiz", "dismiss", "resolve"]),
});

/**
 * Zod schema for querying moderation reports list.
 */
export const AdminReportsQuerySchema = z.object({
  status: z
    .enum(["pending", "reviewed", "resolved", "all"])
    .default("pending")
    .optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export type AdminModerateReportInputSchemaType = z.infer<
  typeof AdminModerateReportSchema
>;
export type AdminReportsQuerySchemaType = z.infer<
  typeof AdminReportsQuerySchema
>;

/**
 * Zod schema for identifying a returning user via browser fingerprint.
 */
export const IdentifyUserSchema = z.object({
  clientFingerprint: z
    .string()
    .trim()
    .min(8, "Fingerprint is required")
    .max(64, "Invalid fingerprint length"),
});

export type IdentifyUserInputSchemaType = z.infer<typeof IdentifyUserSchema>;



