import mongoose, { Schema, type Model } from "mongoose";
import type { IUser } from "@/types/quiz";

/**
 * User model representing quiz creators identified via browser blueprint / network footprint.
 */
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    clientFingerprint: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    ipHash: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },
    image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for high-speed device & network footprint lookup
UserSchema.index({ clientFingerprint: 1, ipHash: 1 });

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
