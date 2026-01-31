import { Router } from "express";
import { inputController, getSessionResultsController } from "./input.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";
import { onboardingLimiter } from "../../shared/middlewares/ipLimit.middleware";

const router = Router();

router.post("/", authenticate, onboardingLimiter, inputController);
router.get("/session/:sessionId", authenticate, getSessionResultsController);

export default router;