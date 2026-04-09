function safeJson(data) {
  try {
    return JSON.stringify(data);
  } catch (_error) {
    return JSON.stringify({ message: "Could not serialize log payload" });
  }
}

function emit(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const payload = {
    timestamp,
    level,
    message,
    ...meta
  };

  const line = safeJson(payload);

  if (level === "error" || level === "alert") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  info(message, meta) {
    emit("info", message, meta);
  },
  warn(message, meta) {
    emit("warn", message, meta);
  },
  error(message, meta) {
    emit("error", message, meta);
  },
  alert(message, meta) {
    emit("alert", message, meta);
  }
};
