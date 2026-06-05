import { Request, Response, NextFunction } from "express";
import { z, ZodSchema, ZodError } from "zod";

// ============================================================
// REQUEST VALIDATION MIDDLEWARE
// Validates request body against a Zod schema
// ============================================================
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: "error",
          message: error.issues[0].message,
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

// ============================================================
// COMMON VALIDATION SCHEMAS
// ============================================================
export const schemas = {
  register: z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, underscore"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),

  login: z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
  }),

  sendMessage: z.object({
    content: z
      .string()
      .min(1, "Message cannot be empty")
      .max(5000, "Message too long"),
    type: z.enum(["text", "image", "file"]).optional(),
  }),

  updateProfile: z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, underscore")
      .optional(),
    bio: z.string().max(100, "Bio cannot exceed 100 characters").optional(),
    avatar: z.string().optional(),
  }),
};