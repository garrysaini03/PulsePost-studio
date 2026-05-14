import { Router } from "express";
import { generateCaption } from "../controllers/aiController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/generate-caption", requireAuth, asyncHandler(generateCaption));

export default router;