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

  app.set("trust proxy", 1);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://pulse-post-studio-client.vercel.app",
  "https://pulse-post-studio-client-cz47ai96r-sainigarry03-2863s-projects.vercel.app",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

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
