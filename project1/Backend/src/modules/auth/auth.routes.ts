import { Router } from "express";
import { registerController, loginController, getMeController } from "./auth.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

const router = Router();

// Public routes
router.post("/register", registerController);
router.post("/login", loginController);

// Protected routes
router.get("/me", authMiddleware, getMeController);

export default router;
