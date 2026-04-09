function getBlockedTerms() {
  const raw = process.env.CHAT_BLOCKED_TERMS || "scam,fraud,phishing,otp,password";
  return raw
    .split(",")
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
}

function hasBlockedTerm(content, blockedTerms) {
  const normalized = content.toLowerCase();
  return blockedTerms.some((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const termRegex = new RegExp(`(^|\\b)${escaped}(\\b|$)`, "i");
    return termRegex.test(normalized);
  });
}

function hasSuspiciousLink(content) {
  const suspiciousDomains = [
    "bit.ly",
    "tinyurl.com",
    "t.me",
    "telegram.me",
    "wa.me",
    "grabify"
  ];

  const lower = content.toLowerCase();
  return suspiciousDomains.some((domain) => lower.includes(domain));
}

function hasExcessiveRepeatedChars(content) {
  const repeatLimit = Number(process.env.CHAT_MAX_REPEAT_CHARS || 12);
  const regex = new RegExp(`(.)\\1{${Math.max(3, repeatLimit)},}`);
  return regex.test(content);
}

export function validateChatMessageContent(content) {
  const blockedTerms = getBlockedTerms();

  if (hasBlockedTerm(content, blockedTerms)) {
    return {
      ok: false,
      reason: "Message contains blocked content."
    };
  }

  if (hasSuspiciousLink(content)) {
    return {
      ok: false,
      reason: "Message contains a suspicious link."
    };
  }

  if (hasExcessiveRepeatedChars(content)) {
    return {
      ok: false,
      reason: "Message looks like spam due to repeated characters."
    };
  }

  return { ok: true };
}

export function chatContentModeration(req, res, next) {
  const content = req.body?.content;

  if (typeof content !== "string") {
    return next();
  }

  const validation = validateChatMessageContent(content);
  if (!validation.ok) {
    return res.status(400).json({
      ok: false,
      message: validation.reason
    });
  }

  return next();
}
