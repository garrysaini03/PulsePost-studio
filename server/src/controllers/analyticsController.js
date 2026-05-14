import { Post } from "../models/Post.js";

const PLATFORMS = [
  { key: "facebook", label: "Facebook", icon: "FB", color: "#1877F2", gradient: "linear-gradient(135deg, #1877F2, #42a5f5)" },
  { key: "instagram", label: "Instagram", icon: "IG", color: "#E4405F", gradient: "linear-gradient(135deg, #E4405F, #fd1d1d, #fcb045)" },
  { key: "youtube", label: "YouTube", icon: "YT", color: "#FF0000", gradient: "linear-gradient(135deg, #FF0000, #ff4444)" },
  { key: "Tiktok", label: "Tiktok", icon: "TK", color: "#FF0000", gradient: "linear-gradient(135deg, #FF0000, #ff4444)" },
];

export const getAnalytics = async (req, res) => {
  const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  const now = new Date();
  const days = buildLastDays(now, 14);

  const platformStats = PLATFORMS.map((platform) => {
    const publishResults = posts.flatMap((post) =>
      (post.results || [])
        .filter((result) => result.provider === platform.key)
        .map((result) => ({ ...result, post }))
    );

    const published = publishResults.filter((result) => result.status === "published").length;
    const failed = publishResults.filter((result) => result.status === "failed").length;
    const pending = publishResults.filter((result) => result.status === "pending").length;
    const selected = posts.filter((post) => (post.platforms || []).includes(platform.key)).length;

    return {
      ...platform,
      selected,
      published,
      failed,
      pending,
      successRate: percentage(published, published + failed),
      chartData: days.map((day) =>
        publishResults.filter((result) => result.status === "published" && sameDay(result.post.updatedAt, day.date)).length
      ),
    };
  });

  const totalPosts = posts.length;
  const allResults = posts.flatMap((post) => post.results || []);
  const totalPublished = allResults.filter((result) => result.status === "published").length;
  const totalFailed = allResults.filter((result) => result.status === "failed").length;
  const totalPending = allResults.filter((result) => result.status === "pending").length;
  const scheduledPosts = posts.filter((post) => post.status === "scheduled").length;
  const successRate = percentage(totalPublished, totalPublished + totalFailed);

  const recentPosts = posts.slice(0, 12).flatMap((post) => {
    if (!post.results?.length) {
      return [{
        title: post.title,
        platform: "none",
        status: post.status,
        message: "No publish results yet.",
        mediaResourceType: post.mediaResourceType,
        date: post.updatedAt || post.createdAt,
      }];
    }

    return post.results.map((result) => ({
      title: post.title,
      platform: result.provider,
      status: result.status,
      message: result.message,
      externalPostId: result.externalPostId,
      mediaResourceType: post.mediaResourceType,
      date: post.updatedAt || post.createdAt,
    }));
  });

  res.status(200).json({
    success: true,
    data: {
      platformStats,
      totals: {
        totalPosts,
        totalPublished,
        totalFailed,
        totalPending,
        scheduledPosts,
        successRate,
      },
      labels: days.map((day) => day.label),
      recentPosts,
      hasData: totalPosts > 0,
    },
  });
};

function buildLastDays(now, count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (count - 1 - index));

    return {
      date,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });
}

function sameDay(value, date) {
  if (!value) {
    return false;
  }

  const left = new Date(value);
  return left.getFullYear() === date.getFullYear()
    && left.getMonth() === date.getMonth()
    && left.getDate() === date.getDate();
}

function percentage(part, total) {
  if (!total) {
    return 0;
  }

  return Math.round((part / total) * 100);
}
