import { Worker } from "bullmq";
import IORedis from "ioredis";
import { env } from "../config/env.js";
import { connectDatabase } from "../config/db.js";
import { publishPostById } from "../services/publishService.js";

async function startWorker() {
  await connectDatabase();

  const connection = new IORedis(env.redisUrl, {
    maxRetriesPerRequest: null,
  });

  const worker = new Worker(
    "publish-post",
    async (job) => {
      await publishPostById(job.data.postId);
    },
    { connection }
  );

  worker.on("completed", (job) => {
    console.log(`Publish job completed: ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Publish job failed: ${job?.id}`);
    console.error(error);
  });

  console.log("PulsePost publisher worker started");
}

startWorker().catch((error) => {
  console.error("Failed to start worker");
  console.error(error);
  process.exit(1);
});
