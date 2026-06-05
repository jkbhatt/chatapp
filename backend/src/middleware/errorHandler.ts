import { Request, Response, NextFunction } from "express";

// ============================================================
// CUSTOM ERROR CLASS
// ============================================================
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================================
// HANDLE MONGOOSE ERRORS
// ============================================================
const handleCastError = (err: any) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateKeyError = (err: any) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists. Please use a different value.`, 400);
};

const handleValidationError = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  return new AppError(`Invalid input: ${errors.join(". ")}`, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please login again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please login again.", 401);

// ============================================================
// SEND ERROR IN DEVELOPMENT (detailed)
// ============================================================
const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// ============================================================
// SEND ERROR IN PRODUCTION (clean)
// ============================================================
const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    // Trusted error — send to client
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming error — don't leak details
    console.error("💥 UNEXPECTED ERROR:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again.",
    });
  }
};

// ============================================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// ============================================================
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message };

    // Handle specific Mongoose errors
    if (err.name === "CastError") error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicateKeyError(error);
    if (err.name === "ValidationError") error = handleValidationError(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// ============================================================
// CATCH ASYNC ERRORS (wrapper function)
// Eliminates need for try/catch in every controller
// ============================================================
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// ============================================================
// 404 HANDLER
// ============================================================
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
};