import { io, Socket } from "socket.io-client";

// ============================================================
// Socket.io Client
// Connects frontend to our backend Socket.io server
// ============================================================

let socket: Socket | null = null;

export const getSocket = (): Socket | null => socket;

export const connectSocket = (userId: string): Socket => {
  if (socket && socket.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
    query: { userId }, // send userId so server knows who connected
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("⚡ Socket connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default socket;