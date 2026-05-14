import mongoose from "mongoose";

const socialAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["facebook", "instagram", "youtube", "Tiktok"],
      required: true,
    },
    providerAccountId: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      default: "",
    },
    tokenExpiresAt: {
      type: Date,
      default: null,
    },
    scope: {
      type: [String],
      default: [],
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

socialAccountSchema.index({ user: 1, provider: 1 }, { unique: true });

export const SocialAccount = mongoose.model("SocialAccount", socialAccountSchema);
