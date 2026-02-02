import rateLimit, {ipKeyGenerator} from "express-rate-limit";
import { ErrorResponseDTO } from "../DTO/resDTO";

export const onboardingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: new ErrorResponseDTO("Too many onboarding attempts. Please try again later."),
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "unknown"),
});
