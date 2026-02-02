import { Router } from "express";
import { inputController, getSessionResultsController } from "./input.controller";
import { streamingInputController } from "./input.streaming.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";
import { rateLimit } from "../../shared/middlewares/rateLimit.middleware";

const router = Router();

router.post("/stream", authenticate, rateLimit, streamingInputController);
router.post("/", authenticate, rateLimit, inputController);
router.get("/session/:sessionId", authenticate, getSessionResultsController);

export default router;