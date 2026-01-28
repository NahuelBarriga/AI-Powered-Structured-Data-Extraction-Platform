import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ErrorResponseDTO } from "../DTO/resDTO";

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // extract token from auth header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const errorResponse = new ErrorResponseDTO(
        "No token provided or invalid format"
      );
      res.status(401).json(errorResponse);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' 

    // Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;

    // attach user info to req
    req.user = {
      id: decoded.userId, //todo: add more user info
    //   email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      const errorResponse = new ErrorResponseDTO("Token expired");
      res.status(401).json(errorResponse);
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      const errorResponse = new ErrorResponseDTO("Invalid token");
      res.status(401).json(errorResponse);
      return;
    }

    const errorResponse = new ErrorResponseDTO("Authentication failed");
    res.status(401).json(errorResponse);
  }
}
