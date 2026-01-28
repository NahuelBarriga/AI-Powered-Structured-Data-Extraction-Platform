import { Router } from "express";
import { inputController } from "./input.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, inputController);

export default router;
