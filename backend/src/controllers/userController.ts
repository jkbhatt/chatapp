import { Request, Response } from "express";
import User from "../models/User";

// ============================================================
// GET USER PROFILE
// GET /api/users/:userId
// ============================================================
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }

    res.status(200).json({ status: "success", user });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to get user profile" });
  }
};

// ============================================================
// UPDATE USER PROFILE
// PUT /api/users/profile
// ============================================================
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const myId = (req as any).userId as string;
    const { username, bio, avatar } = req.body;

    // Check if username is taken by another user
    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: myId },
      });

      if (existingUser) {
        res.status(400).json({
          status: "error",
          message: "Username is already taken",
        });
        return;
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      myId,
      {
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(avatar && { avatar }),
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ status: "error", message: "Failed to update profile" });
  }
};

// ============================================================
// SEARCH USERS
// GET /api/users/search?q=username
// ============================================================
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const myId = (req as any).userId as string;
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      res.status(400).json({ status: "error", message: "Search query required" });
      return;
    }

    const users = await User.find({
      _id: { $ne: myId },
      username: { $regex: q, $options: "i" },
    })
      .select("username email avatar isOnline bio")
      .limit(10);

    res.status(200).json({ status: "success", users });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Search failed" });
  }
};