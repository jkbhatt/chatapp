import { Server, Socket } from "socket.io";
import User from "../models/User";

// ============================================================
// Online Users Map
// Stores: { userId: socketId }
// ============================================================
const onlineUsers = new Map<string, string>();

export const initSocket = (io: Server) => {
  io.on("connection", async (socket: Socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Get userId from socket handshake
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      // Add to online users map
      onlineUsers.set(userId, socket.id);

      // Update user's online status in DB
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date(),
      });

      // Broadcast to ALL users who is online
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
      console.log(`✅ User ${userId} is now online`);
    }

    // ============================================================
    // SEND MESSAGE EVENT
    // Triggered when a user sends a message
    // ============================================================
    socket.on("sendMessage", async (data: {
      receiverId: string;
      message: any;
    }) => {
      const { receiverId, message } = data;

      // Find receiver's socket id
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        // Send message to receiver in real-time
        io.to(receiverSocketId).emit("newMessage", message);
        console.log(`📨 Message sent from ${userId} to ${receiverId}`);
      }
    });

    // ============================================================
    // TYPING EVENTS
    // ============================================================
    socket.on("typing", (data: { receiverId: string }) => {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { senderId: userId });
      }
    });

    socket.on("stopTyping", (data: { receiverId: string }) => {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStoppedTyping", { senderId: userId });
      }
    });

    // ============================================================
    // DISCONNECT EVENT
    // ============================================================
    socket.on("disconnect", async () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);

      if (userId) {
        // Remove from online users
        onlineUsers.delete(userId);

        // Update DB
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        // Broadcast updated online users list
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
        console.log(`❌ User ${userId} is now offline`);
      }
    });
  });
};

export { onlineUsers };