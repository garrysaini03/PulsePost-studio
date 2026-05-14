import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, "../../../.env");
const serverEnvPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: serverEnvPath, override: true });

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function parseList(value) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const serverUrl = process.env.SERVER_URL || "http://localhost:5000";

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT || 5000),
  clientUrl,
  clientUrls: [clientUrl, ...parseList(process.env.ALLOWED_ORIGINS)],
  serverUrl,
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  queueEnabled: parseBoolean(process.env.QUEUE_ENABLED, true),
  openrouterKey: process.env.OPENROUTER_API_KEY || "",
  meta: {
    apiVersion: process.env.META_API_VERSION || "v20.0",
    facebook: {
      pageId: process.env.FB_PAGE_ID || "",
      pageAccessToken: process.env.FB_PAGE_ACCESS_TOKEN || "",
    },
    instagram: {
      userId: process.env.IG_USER_ID || "",
      accessToken: process.env.IG_ACCESS_TOKEN || "",
    },
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  youtube: {
    privacyStatus: process.env.YOUTUBE_PRIVACY_STATUS || "unlisted",
  },
  providers: {
    youtube: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectUri: process.env.GOOGLE_REDIRECT_URI || "",
    },
    facebook: {
      clientId: process.env.META_CLIENT_ID || "",
      clientSecret: process.env.META_CLIENT_SECRET || "",
      redirectUri: process.env.META_REDIRECT_URI || "",
    },
    instagram: {
      clientId: process.env.META_CLIENT_ID || "",
      clientSecret: process.env.META_CLIENT_SECRET || "",
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI || process.env.META_INSTAGRAM_REDIRECT_URI || "",
    },
  },
};
