import { Router } from "express";
import {
  getOAuthUrl,
  handleOAuthCallback,
  listAccounts,
} from "../controllers/socialController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/accounts", requireAuth, asyncHandler(listAccounts));
router.get("/:provider/url", requireAuth, asyncHandler(getOAuthUrl));
router.get("/:provider/callback", asyncHandler(handleOAuthCallback));

export default router;
