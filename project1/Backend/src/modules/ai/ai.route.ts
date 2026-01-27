//testing porposes
import { Router } from "express";
import { extractOrderController } from "./ai.controller";


const router = Router();

router.post("/extract-order", extractOrderController);

export default router;
