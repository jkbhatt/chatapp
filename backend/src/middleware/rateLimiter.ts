import rateLimit from "express-rate-limit";

// ============================================================
// GENERAL API RATE LIMITER
// Limits each IP to 100 requests per 15 minutes
// ============================================================
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per window
  message: {
    status: "error",
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================
// AUTH RATE LIMITER
// Stricter limit for login/register (prevent brute force)
// Only 10 attempts per 15 minutes
// ============================================================
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // only 10 auth attempts
  message: {
    status: "error",
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // don't count successful logins
});

// ============================================================
// MESSAGE RATE LIMITER
// Limits message sending (prevent spam)
// Max 30 messages per minute
// ============================================================
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: {
    status: "error",
    message: "You are sending messages too fast. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});