import { Router } from "express";
import { inputController } from "./input.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";
import { onboardingLimiter } from "../../shared/middlewares/ipLimit.middleware";

const router = Router();

router.post("/", authenticate, onboardingLimiter, inputController);
export default router;
    