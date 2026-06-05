import { Router } from "express";
import {
  getMessages,
  sendMessage,
  getUsersForSidebar,
  deleteMessage,
} from "../controllers/messageController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// All message routes are protected
router.use(protect);

// GET all users for sidebar
router.get("/users", getUsersForSidebar);

// GET messages between two users
router.get("/:userId", getMessages);

// POST send a message
router.post("/send/:userId", sendMessage);

// DELETE a message
router.delete("/:messageId", deleteMessage);

export default router;