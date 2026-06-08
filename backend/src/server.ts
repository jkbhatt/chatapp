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
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(compression());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api", generalLimiter);
app.use(logger);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
// HEALTH CHECK
// ============================================================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "ChatApp Server is running! 🚀",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: `${Math.floor(process.uptime())} seconds`,
  });
});

// ============================================================
// API ROUTES
// ============================================================

console.log("✅ Auth routes mounted at /api/auth");

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// ============================================================
// SOCKET.IO
// ============================================================

initSocket(io);

// ============================================================
// ERROR HANDLING
// ============================================================

app.use(notFound);
app.use(globalErrorHandler);

// ============================================================
// HANDLE UNHANDLED ERRORS
// ============================================================

process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err.name, err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err: any) => {
  console.error("💥 UNHANDLED REJECTION:", err.name, err.message);
  httpServer.close(() => process.exit(1));
});

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`
🚀 ==================================
   ChatApp Server is LIVE!
   Port: ${PORT}
   Environment: ${process.env.NODE_ENV}
================================== 🚀
    `);
  });
};

startServer();

export { io };
export default app;