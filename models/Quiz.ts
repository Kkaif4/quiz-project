import mongoose, { Schema, type Model } from "mongoose";
import type { IQuiz } from "@/types/quiz";

const QuizOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 100 },
  },
  { _id: false },
);

const QuizQuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 300 },
    type: {
      type: String,
      enum: ["single"],
      default: "single",
    },
    options: {
      type: [QuizOptionSchema],
      required: true,
      validate: [
        {
          validator: (options: Array<{ id: string }>) =>
            Array.isArray(options) &&
            options.length >= 2 &&
            options.length <= 6,
          message: "Questions must have between 2 and 6 options",
        },
        {
          validator: (options: Array<{ id: string }>) =>
            Array.isArray(options) &&
            new Set(options.map((o) => o.id)).size === options.length,
          message: "Option IDs within a question must be unique",
        },
      ],
    },
    /**
     * CRITICAL SECURITY INVARIANT:
     * Authoritative answer key. Must NEVER be projected in public responses.
     */
    correctOptionId: {
      type: String,
      required: true,
      validate: {
        validator(this: { options?: Array<{ id: string }> }, val: string) {
          if (!this.options || !Array.isArray(this.options)) return false;
          return this.options.some((o) => o.id === val);
        },
        message:
          "correctOptionId must match an option id within the question",
      },
    },
  },
  { _id: false },
);

const QuizSchema = new Schema<IQuiz>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ownerTokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    questions: {
      type: [QuizQuestionSchema],
      required: true,
      validate: [
        {
          validator: (questions: Array<{ id: string }>) =>
            Array.isArray(questions) &&
            questions.length >= 3 &&
            questions.length <= 15,
          message: "Quiz must contain between 3 and 15 questions",
        },
        {
          validator: (questions: Array<{ id: string }>) =>
            Array.isArray(questions) &&
            new Set(questions.map((q) => q.id)).size === questions.length,
          message: "Question IDs within a quiz must be unique",
        },
      ],
    },
    settings: {
      showScore: { type: Boolean, default: true },
      showCorrectAnswers: { type: Boolean, default: false },
      maxAttemptsPerPerson: { type: Number, default: 1, min: 1, max: 10 },
    },
    stats: {
      attempts: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

QuizSchema.index({ status: 1, updatedAt: -1 });

export const Quiz: Model<IQuiz> =
  (mongoose.models.Quiz as Model<IQuiz>) ||
  mongoose.model<IQuiz>("Quiz", QuizSchema);

export default Quiz;
