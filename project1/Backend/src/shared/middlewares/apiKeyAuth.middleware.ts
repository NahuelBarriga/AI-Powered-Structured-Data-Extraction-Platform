import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../infra/db/prisma";

export async function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.header("X-API-Key");

  if (!apiKey) {
    return res.status(401).json({ error: "API key missing" });
  }

  const user = await prisma.user.findUnique({
    where: { apikey: apiKey },
  });

  if (!user) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  // user context (tenant boundary)
  req.user = {
    id: user.id,
  };

  next();
}
