import { Post } from "../models/Post.js";
import { enqueuePost } from "../services/queueService.js";
import { publishPostById } from "../services/publishService.js";

export async function listPosts(req, res) {
  const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ posts });
}

export async function createPost(req, res) {
  const {
    title,
    caption,
    hashtags = [],
    mediaUrl,
    mediaPublicId,
    mediaResourceType,
    platforms = [],
    publishAt,
  } = req.body;

  if (!title || !caption || !mediaUrl || !mediaPublicId || platforms.length === 0) {
    return res.status(400).json({ message: "Title, caption, upload, and platforms are required" });
  }

  const status = publishAt ? "scheduled" : "queued";

  const post = await Post.create({
    user: req.user._id,
    title,
    caption,
    hashtags,
    mediaUrl,
    mediaPublicId,
    mediaResourceType: mediaResourceType || "image",
    platforms,
    publishAt: publishAt || null,
    status,
    results: platforms.map((provider) => ({
      provider,
      status: "pending",
      message: publishAt ? "Waiting for scheduled publish time" : "Queued for immediate publishing",
    })),
  });

  try {
    const queueResult = await enqueuePost(post);

    if (!queueResult.queued && !publishAt) {
      await publishPostById(post._id);
      const updatedPost = await Post.findById(post._id);
      return res.status(201).json({ post: updatedPost });
    }
  } catch (error) {
    if (publishAt) {
      return res.status(503).json({
        message: "Redis is required for scheduled posts. Start Redis or set QUEUE_ENABLED=false in .env.",
      });
    }

    await publishPostById(post._id);
    const updatedPost = await Post.findById(post._id);
    return res.status(201).json({ post: updatedPost });
  }

  res.status(201).json({ post });
}
