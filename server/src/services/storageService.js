import { cloudinary } from "../config/cloudinary.js";

export async function uploadMediaAsset(filePath, mimeType = "") {
  const isImage = mimeType.startsWith("image/");
  const resourceType = isImage ? "image" : "video";
  const folder = isImage ? "pulsepost/images" : "pulsepost/videos";

  const uploadOptions = {
    resource_type: resourceType,
    folder,
  };

  const response = isImage
    ? await cloudinary.uploader.upload(filePath, uploadOptions)
    : await cloudinary.uploader.upload_large(filePath, {
        ...uploadOptions,
        chunk_size: 20 * 1024 * 1024,
      });

  return {
    url: response.secure_url,
    secure_url: response.secure_url,
    public_id: response.public_id,
    secureUrl: response.secure_url,
    publicId: response.public_id,
    bytes: response.bytes,
    duration: response.duration,
    resourceType,
    format: response.format,
  };
}
