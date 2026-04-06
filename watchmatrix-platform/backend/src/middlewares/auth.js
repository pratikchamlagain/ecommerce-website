import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (_error) {
    return res.status(401).json({ ok: false, message: "Invalid or expired token" });
  }
}

export function requireRoles(...allowedRoles) {
  return function roleGuard(req, res, next) {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    return next();
  };
}
