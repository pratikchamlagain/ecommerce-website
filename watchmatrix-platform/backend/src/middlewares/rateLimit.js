import rateLimit from "express-rate-limit";

function asNumber(value, fallback) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function createLimiter({
  windowMs,
  max,
  message
}) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      ok: false,
      message
    }
  });
}

export const authRateLimit = createLimiter({
  windowMs: asNumber(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: asNumber(process.env.AUTH_RATE_LIMIT_MAX, 20),
  message: "Too many authentication attempts. Please try again later."
});

export const chatCreateRateLimit = createLimiter({
  windowMs: asNumber(process.env.CHAT_CREATE_RATE_LIMIT_WINDOW_MS, 60 * 1000),
  max: asNumber(process.env.CHAT_CREATE_RATE_LIMIT_MAX, 12),
  message: "Too many chat actions. Please slow down and try again."
});
