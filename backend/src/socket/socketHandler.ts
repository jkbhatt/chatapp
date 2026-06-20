import { Server, Socket } from "socket.io";

// Map of userId -> socketId
const onlineUsers = new Map<string, string>();

export const initSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`✅ User connected: ${userId} (${socket.id})`);

      // Broadcast updated online users list to everyone
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    }

    // ============================================================
    // SEND MESSAGE
    // ============================================================
    socket.on("sendMessage", ({ receiverId, message }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }
    });

    // ============================================================
    // DELETE MESSAGE — NEW
    // Notifies the other user in real-time when a message is deleted
    // ============================================================
    socket.on("deleteMessage", ({ receiverId, messageId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", { messageId });
      }
    });

    // ============================================================
    // TYPING INDICATORS
    // ============================================================
    socket.on("typing", ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { senderId: userId });
      }
    });

    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStoppedTyping", { senderId: userId });
      }
    });

    // ============================================================
    // DISCONNECT
    // ============================================================
    socket.on("disconnect", () => {
      if (userId) {
        onlineUsers.delete(userId);
        console.log(`❌ User disconnected: ${userId}`);
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
      }
    });
  });
};

export const getOnlineUsersMap = () => onlineUsers;