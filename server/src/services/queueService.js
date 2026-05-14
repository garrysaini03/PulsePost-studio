import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "../config/env.js";

let publishQueue;

export async function enqueuePost(post) {
  if (!env.queueEnabled) {
    return { queued: false, reason: "QUEUE_DISABLED" };
  }

  if (!publishQueue) {
    const connection = new IORedis(env.redisUrl, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });

    await connection.connect();
    publishQueue = new Queue("publish-post", { connection });
  }

  const delay = post.publishAt ? Math.max(new Date(post.publishAt).getTime() - Date.now(), 0) : 0;

  await publishQueue.add(
    "publish",
    { postId: post._id.toString() },
    {
      delay,
      removeOnComplete: 50,
      removeOnFail: 100,
    }
  );

  return { queued: true };
}
