export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.code === "LIMIT_FILE_SIZE"
    ? 413
    : error.statusCode
    ? error.statusCode
    : res.statusCode >= 400
    ? res.statusCode
    : 500;
  const message = error.message || "Unexpected server error";

  res.status(statusCode).json({
    message: error.code === "LIMIT_FILE_SIZE"
      ? "File is too large. Please upload a file up to 250 MB."
      : message,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
}
