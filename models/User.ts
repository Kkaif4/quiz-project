import mongoose, { Schema, type Model } from "mongoose";
import type { IUser } from "@/types/quiz";

/**
 * Placeholder User model for post-MVP account linking and quiz claiming.
 * MVP anonymous quiz creators do not require documents in this collection.
 */
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 50,
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

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
