import { Router } from "express";
import { registerController } from "./auth.controller";

const router = Router();

// Public routes
router.post("/onboarding", registerController);


export default router;
