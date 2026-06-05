import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        status: "error",
        message: "Access denied. No token provided. Please login.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        status: "error",
        message: "Access denied. Invalid token format.",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not defined");

    const decoded = jwt.verify(token, secret) as { userId: string };

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        status: "error",
        message: "User no longer exists. Please login again.",
      });
      return;
    }

    req.userId = decoded.userId;
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: "error",
        message: "Invalid token. Please login again.",
      });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: "error",
        message: "Token expired. Please login again.",
      });
      return;
    }
    res.status(500).json({ status: "error", message: "Something went wrong" });
  }
};