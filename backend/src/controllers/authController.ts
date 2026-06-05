import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { z, ZodError } from "zod";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, underscore"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not defined");
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { username, email, password } = validatedData;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      res.status(400).json({
        status: "error",
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Username already taken",
      });
      return;
    }

    const user = await User.create({
      username,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      status: "success",
      message: "Account created successfully!",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isOnline: user.isOnline,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ status: "error", message: error.issues[0].message });
      return;
    }
    console.error("Register error:", error);
    res.status(500).json({ status: "error", message: "Something went wrong." });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401).json({ status: "error", message: "Invalid email or password" });
      return;
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      res.status(401).json({ status: "error", message: "Invalid email or password" });
      return;
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id.toString());

    res.status(200).json({
      status: "success",
      message: "Welcome back!",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isOnline: user.isOnline,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ status: "error", message: error.issues[0].message });
      return;
    }
    console.error("Login error:", error);
    res.status(500).json({ status: "error", message: "Something went wrong." });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).userId);
    if (!user) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }
    res.status(200).json({
      status: "success",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isOnline: user.isOnline,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Something went wrong" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    await User.findByIdAndUpdate((req as any).userId, {
      isOnline: false,
      lastSeen: new Date(),
    });
    res.status(200).json({ status: "success", message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Something went wrong" });
  }
};