import morgan from "morgan";
import { Request, Response } from "express";

// ============================================================
// CUSTOM MORGAN LOGGER
// Logs every HTTP request with color coding
// ============================================================

// Custom token for response time color
morgan.token("colored-status", (req: Request, res: Response) => {
  const status = res.statusCode;
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // Red
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // Yellow
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`; // Cyan
  return `\x1b[32m${status}\x1b[0m`; // Green
});

// Development logger — detailed
export const devLogger = morgan(
  ":method :url :colored-status :response-time ms - :res[content-length]"
);

// Production logger — minimal
export const prodLogger = morgan("combined");

// Choose based on environment
export const logger =
  process.env.NODE_ENV === "production" ? prodLogger : devLogger;