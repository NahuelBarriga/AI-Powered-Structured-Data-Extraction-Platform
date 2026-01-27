import { Router } from "express";
import { inputController } from "./input.controller";
// import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/",
  // authenticateJWT,     //todo: implement
  inputController
);

export default router;
