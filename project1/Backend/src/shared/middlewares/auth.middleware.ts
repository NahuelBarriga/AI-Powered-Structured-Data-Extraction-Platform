import jwt from "jsonwebtoken";
import { prisma } from "../../infra/db/prisma";
import type { Request, Response, NextFunction } from "express";
import { ErrorResponseDTO } from "../DTO/resDTO";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.session;


    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        if (!payload.sub || typeof payload.sub !== "string") {
          return res.status(401).json(new ErrorResponseDTO("Unauthorized"));
        }
        req.user = {
          id: payload.sub
        };
        // req.authType = "session";
        return next();
      } catch (err) {
         return res.status(401).json(new ErrorResponseDTO("Unauthorized"));
      }
    } else {
      return res.status(401).json(new ErrorResponseDTO("Unauthorized"));
    }

  } catch (err) {
    return res.status(401).json(new ErrorResponseDTO("Unauthorized"));
  }
}
