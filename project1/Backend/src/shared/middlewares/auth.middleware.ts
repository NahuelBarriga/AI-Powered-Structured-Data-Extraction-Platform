import jwt from "jsonwebtoken";
import { prisma } from "../../infra/db/prisma";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.session;
    console.log("Authenticating request..."); //!debug


    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        if (!payload.sub || typeof payload.sub !== "string") {
          return res.status(401).json({ error: "Unauthorized" });
        }
        req.user = {
          id: payload.sub
        };
        // req.authType = "session";
        return next();
      } catch (err) {
         return res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }

  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
