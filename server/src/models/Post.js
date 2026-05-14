import mongoose from "mongoose";

const publishResultSchema = new mongoose.Schema(
  {
    provider: String,
    status: {
      type: String,
      enum: ["pending", "published", "failed"],
      default: "pending",
    },
    externalPostId: String,
    message: String,
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      required: true,
    },
    hashtags: {
      type: [String],
      default: [],
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    mediaPublicId: {
      type: String,
      required: true,
    },
    mediaResourceType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    platforms: {
      type: [String],
      enum: ["facebook", "instagram", "youtube","Tiktok"],
      required: true,
    },
    publishAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "queued", "scheduled", "processing", "published", "failed"],
      default: "queued",
    },
    results: {
      type: [publishResultSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.model("Post", postSchema);
