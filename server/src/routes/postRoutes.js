import { Router } from "express";
import { createPost, listPosts } from "../controllers/postController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(listPosts));
router.post("/", requireAuth, asyncHandler(createPost));

export default router;
