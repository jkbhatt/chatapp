import { Router } from "express";
import { register, login, getMe, logout } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;