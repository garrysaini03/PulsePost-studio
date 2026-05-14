import fs from "node:fs/promises";
import { uploadMediaAsset } from "../services/storageService.js";

export async function uploadVideo(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Image or video file is required" });
  }

  try {
    const asset = await uploadMediaAsset(req.file.path, req.file.mimetype);
    res.status(201).json({ asset });
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }
}
