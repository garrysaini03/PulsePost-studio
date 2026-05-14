import { Router } from "express";
import multer from "multer";
import { uploadVideo } from "../controllers/uploadController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 250 * 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      callback(null, true);
      return;
    }

    const error = new Error("Only image and video files are allowed");
    error.statusCode = 400;
    callback(error);
  },
});
const router = Router();

router.post("/video", requireAuth, upload.single("media"), asyncHandler(uploadVideo));

export default router;
