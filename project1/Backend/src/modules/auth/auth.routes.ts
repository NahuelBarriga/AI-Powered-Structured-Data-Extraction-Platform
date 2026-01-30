import { Router } from "express";
import { registerController } from "./auth.controller";
import { onboardingLimiter } from "../../shared/middlewares/ipLimit.middleware";

const router = Router();

// Public routes
router.post("/", onboardingLimiter, registerController);


export default router;
