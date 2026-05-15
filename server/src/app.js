import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import socialRoutes from "./routes/socialRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { env } from "./config/env.js";

export function createApp() {

  const app = express();
  const allowedOrigins = new Set([
    ...env.clientUrls,
    "http://localhost:5173",
    "http://localhost:5174",
  ]);

  app.set("trust proxy", 1);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);  

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      environment: env.isProduction ? "production" : "development",
      meta: {
        apiVersion: env.meta.apiVersion,
        staticFacebookPublishing: Boolean(env.meta.facebook.pageId && env.meta.facebook.pageAccessToken),
        staticInstagramPublishing: Boolean(env.meta.instagram.userId && env.meta.instagram.accessToken),
      },
    });
  });

  app.get("/api/ready", (req, res) => {
    const databaseReady = mongoose.connection.readyState === 1;
    res.status(databaseReady ? 200 : 503).json({
      ok: databaseReady,
      database: databaseReady ? "connected" : "unavailable",
      queue: env.queueEnabled ? "enabled" : "disabled",
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/social", socialRoutes);
  app.use("/api/uploads", uploadRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/analytics", analyticsRoutes);

  app.use(notFound);

  app.use(errorHandler);

  return app;
}
