import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";

import connectDB from "./config/database";

import authRoutes from "./routes/authRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes";

import { initSocket } from "./socket/socketHandler";
import { generalLimiter, authLimiter } from "./middleware/rateLimiter";
import { globalErrorHandler, notFound } from "./middleware/errorHandler";
import { logger } from "./utils/logger";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

const httpServer = createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ============================================================
// SECURITY
// ============================================================

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

app.use(compression());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(logger);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", generalLimiter);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "ChatApp Server is running 🚀",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// ============================================================
// TEST ROUTE
// ============================================================

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API test working",
  });
});

// ============================================================
// ROUTES
// ============================================================

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// ============================================================
// SOCKET
// ============================================================

initSocket(io);

// ============================================================
// ERROR HANDLING
// ============================================================

app.use(notFound);
app.use(globalErrorHandler);

// ============================================================
// PROCESS ERRORS
// ============================================================

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);

  httpServer.close(() => {
    process.exit(1);
  });
});

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`
====================================
🚀 ChatApp Backend Running
🌍 Environment: ${process.env.NODE_ENV}
🔌 Port: ${PORT}
====================================
`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

export { io };
export default app;