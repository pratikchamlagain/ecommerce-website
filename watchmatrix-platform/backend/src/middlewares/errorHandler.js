import { logger } from "../utils/logger.js";

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;

  logger.error("API error", {
    statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });

  res.status(statusCode).json({
    ok: false,
    message: err.message || "Internal server error"
  });
}
