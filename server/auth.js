import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "dev-only-insecure-secret-change-me";
const COOKIE_NAME = "admin_token";

if (!process.env.ADMIN_JWT_SECRET) {
  console.warn(
    "[auth] ADMIN_JWT_SECRET is not set — using an insecure default. Set it in your PaaS env vars before going live."
  );
}

export function checkPassword(candidate) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.warn("[auth] ADMIN_PASSWORD is not set — admin login is disabled until you set it.");
    return false;
  }
  return typeof candidate === "string" && candidate.length > 0 && candidate === expected;
}

export function issueToken(res) {
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearToken(res) {
  res.clearCookie(COOKIE_NAME);
}

export function requireAdmin(req, res, next) {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.[COOKIE_NAME] || bearer;
  if (!token) return res.status(401).json({ error: "Not authenticated." });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Session expired, please log in again." });
  }
}
