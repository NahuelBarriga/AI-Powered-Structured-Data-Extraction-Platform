import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../infra/db/prisma";

/**
 * Middleware for mock user authentication during development.
 * Currently disabled but available for testing without full auth setup.
 * 
 * @param req - Express request
 * @param _res - Express response (unused)
 * @param next - Next middleware in chain
 */
export async function mockUser(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  let user = await prisma.user.findFirst();

  if (!user) {
    // user = await prisma.user.create({
    //   data: {
    //     name: "Mock User",
    //     email: "mock@user.local",
    //   },
    // });
  }

  // req.user = user; 
  next();
}
