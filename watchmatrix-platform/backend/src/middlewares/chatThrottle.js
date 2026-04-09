const userMessageBuckets = new Map();

function asNumber(value, fallback) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

const WINDOW_MS = asNumber(process.env.CHAT_MESSAGE_WINDOW_MS, 10 * 1000);
const MAX_MESSAGES = asNumber(process.env.CHAT_MESSAGE_MAX_PER_WINDOW, 6);

export function chatMessageThrottle(req, res, next) {
  const userId = req.user?.sub;

  if (!userId) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const now = Date.now();
  const bucket = userMessageBuckets.get(userId) || [];
  const fresh = bucket.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (fresh.length >= MAX_MESSAGES) {
    return res.status(429).json({
      ok: false,
      message: "You are sending messages too fast. Please wait a moment."
    });
  }

  fresh.push(now);
  userMessageBuckets.set(userId, fresh);

  return next();
}
