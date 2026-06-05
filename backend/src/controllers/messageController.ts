import { Request, Response } from "express";
import mongoose from "mongoose";
import Message from "../models/Message";
import User from "../models/User";

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const myId = (req as any).userId as string;
    const userId = req.params.userId as string;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    })
      .populate("sender", "username avatar isOnline")
      .populate("receiver", "username avatar isOnline")
      .sort({ createdAt: 1 })
      .limit(100);

    await Message.updateMany(
      { sender: userId, receiver: myId, seen: false },
      { seen: true, delivered: true }
    );

    res.status(200).json({ status: "success", messages });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ status: "error", message: "Failed to get messages" });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const myId = (req as any).userId as string;
    const userId = req.params.userId as string;
    const { content, type = "text" } = req.body;

    if (!content || content.trim() === "") {
      res.status(400).json({ status: "error", message: "Message content cannot be empty" });
      return;
    }

    const newMessage = new Message({
      sender: new mongoose.Types.ObjectId(myId),
      receiver: new mongoose.Types.ObjectId(userId),
      content: content.trim(),
      type,
      delivered: true,
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "username avatar isOnline")
      .populate("receiver", "username avatar isOnline");

    res.status(201).json({ status: "success", message: populatedMessage });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ status: "error", message: "Failed to send message" });
  }
};

export const getUsersForSidebar = async (req: Request, res: Response): Promise<void> => {
  try {
    const myId = (req as any).userId as string;

    const users = await User.find({ _id: { $ne: myId } })
      .select("username email avatar isOnline lastSeen bio")
      .sort({ isOnline: -1, username: 1 });

    res.status(200).json({ status: "success", users });
  } catch (error) {
    console.error("getUsersForSidebar error:", error);
    res.status(500).json({ status: "error", message: "Failed to get users" });
  }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const myId = (req as any).userId as string;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404).json({ status: "error", message: "Message not found" });
      return;
    }

    if (message.sender.toString() !== myId) {
      res.status(403).json({ status: "error", message: "You can only delete your own messages" });
      return;
    }

    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ status: "success", message: "Message deleted" });
  } catch (error) {
    console.error("deleteMessage error:", error);
    res.status(500).json({ status: "error", message: "Failed to delete message" });
  }
};