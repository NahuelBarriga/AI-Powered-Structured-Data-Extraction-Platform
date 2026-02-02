import { prisma } from "../../infra/db/prisma";
import type { Request, Response, NextFunction } from "express";
import { RATE_LIMITS } from "../../config/rateLimits";
import { ErrorResponseDTO } from "../DTO/resDTO";

export async function rateLimit(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json(new ErrorResponseDTO("Unauthorized"));
  }

  for (const rule of RATE_LIMITS) {
    const window = rule.windowFn();

    const counter = await prisma.usageCounter.upsert({
      where: {
        userId_window_type: {
          userId,
          window,
          type: rule.name,
        },
      },
      update: { count: { increment: 1 } },
      create: {
        userId,
        window,
        type: rule.name,
        count: 1,
      },
    });

    if (counter.count > rule.max) {
      return res.status(429).json(new ErrorResponseDTO("Rate limit exceeded"));
    }
  }

  next();
}



