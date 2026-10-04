import mongoose, { Schema, type Model } from "mongoose";
import type { IReport } from "@/types/quiz";

const ReportSchema = new Schema<IReport>(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ["spam", "harassment", "sexual", "hate", "impersonation", "other"],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Report: Model<IReport> =
  (mongoose.models.Report as Model<IReport>) ||
  mongoose.model<IReport>("Report", ReportSchema);

export default Report;
