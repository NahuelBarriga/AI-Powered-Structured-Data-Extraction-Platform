import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../infra/db/prisma";

export async function mockUser(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  let user = await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Mock User",
        email: "mock@user.local",
      },
    });
  }

  req.user = user; // extend Express Request type later
  next();
}
