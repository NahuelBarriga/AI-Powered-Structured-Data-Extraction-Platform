import { Router } from "express";
import { inputController } from "./input.controller";
import { apiKeyAuth  } from "../../shared/middlewares/apiKeyAuth.middleware";

const router = Router();

router.post("/", apiKeyAuth, inputController);

export default router;
    