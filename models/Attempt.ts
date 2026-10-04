import mongoose, { Schema, type Model } from "mongoose";
import type { IAttempt } from "@/types/quiz";

const AttemptAnswerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    optionId: { type: String, required: true },
  },
  { _id: false },
);

const AttemptSchema = new Schema<IAttempt>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    answers: {
      type: [AttemptAnswerSchema],
      required: true,
      validate: {
        validator: (answers: Array<{ questionId: string }>) =>
          Array.isArray(answers) &&
          new Set(answers.map((a) => a.questionId)).size === answers.length,
        message: "Answers array cannot contain duplicate question IDs",
      },
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    metadata: {
      userAgent: {
        type: String,
        default: null,
      },
      ipHash: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for high-speed, zero-memory-sort leaderboard queries
AttemptSchema.index({ quizId: 1, score: -1, createdAt: -1 });

// Compound index for chronological attempt history in owner dashboard
AttemptSchema.index({ quizId: 1, createdAt: -1 });

// Compound index for fast per-person attempt frequency and limit verification
AttemptSchema.index({ quizId: 1, "metadata.ipHash": 1 });

export const Attempt: Model<IAttempt> =
  (mongoose.models.Attempt as Model<IAttempt>) ||
  mongoose.model<IAttempt>("Attempt", AttemptSchema);

export default Attempt;
