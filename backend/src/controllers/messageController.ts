import { Request, Response } from "express";
import mongoose from "mongoose";
import Message from "../models/Message";
import User from "../models/User";

// ============================================================
// GET ALL USERS (for sidebar)
// GET /api/messages/users
// ============================================================
export const getUsersForSidebar = async (req: Request, res: Response): Promise<void> => {
  try {
    const myId = (req as any).userId as string;

    const users = await User.find({ _id: { $ne: myId } })
      .select("username email avatar bio isOnline lastSeen createdAt");

    res.status(200).json({ status: "success", users });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to get users" });
  }
};

// ============================================================
// GET MESSAGES between me and another user
// GET /api/messages/:userId
// ============================================================
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const myId = (req as any).userId as string;
    const { userId: otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    })
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar")
      .sort({ createdAt: 1 });

    res.status(200).json({ status: "success", messages });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to get messages" });
  }
};

// ============================================================
// SEND MESSAGE
// POST /api/messages/send/:userId
// ============================================================
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const myId = (req as any).userId as string;
    const { userId: receiverId } = req.params;
    const { content, type = "text" } = req.body;

    if (!content || content.trim() === "") {
      res.status(400).json({ status: "error", message: "Message content is required" });
      return;
    }

    const message = await Message.create({
      sender: new mongoose.Types.ObjectId(myId),
      receiver: new mongoose.Types.ObjectId(receiverId),
      content,
      type,
      seen: false,
      delivered: true,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar");

    res.status(201).json({
      status: "success",
      message: populatedMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ status: "error", message: "Failed to send message" });
  }
};

// ============================================================
// DELETE MESSAGE
// DELETE /api/messages/:messageId
// Returns the receiverId so frontend can emit socket event
// ============================================================
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const myId = (req as any).userId as string;
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      res.status(400).json({ status: "error", message: "Invalid message ID" });
      return;
    }

    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404).json({ status: "error", message: "Message not found" });
      return;
    }

    // Only sender can delete their own message
    if (message.sender.toString() !== myId) {
      res.status(403).json({ status: "error", message: "You can only delete your own messages" });
      return;
    }

    // Capture receiver before deleting, so frontend knows who to notify
    if (!message.receiver) {
      res.status(400).json({ status: "error", message: "Message has no receiver" });
      return;
    }
    const receiverId = message.receiver.toString();

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      status: "success",
      message: "Message deleted successfully",
      messageId,
      receiverId, // <-- needed by frontend to emit socket event
    });
  } catch (error) {
    console.error("deleteMessage error:", error);
    res.status(500).json({ status: "error", message: "Failed to delete message" });
  }
};