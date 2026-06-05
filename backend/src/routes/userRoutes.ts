import { Router } from "express";
import {
  getUserProfile,
  updateProfile,
  searchUsers,
} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// All routes protected
router.use(protect);

// Search users
router.get("/search", searchUsers);

// Get user profile
router.get("/:userId", getUserProfile);

// Update my profile
router.put("/profile/update", updateProfile);

export default router;