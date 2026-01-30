import type { Request, Response } from "express";
import { ErrorResponseDTO, SuccessResponseDTO } from "../../shared/DTO/resDTO";
import authService from "./auth.service"

/**
 * Register a new user
 */
export async function registerController(req: Request, res: Response) {
  try {
    const auth = await authService.setTenant();
    const successResponse = new SuccessResponseDTO(auth);
    
    res.cookie("session", auth.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 24h
    });
    res.status(201).json(successResponse);


  } catch (error) {
    console.error("session error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "session failed";
    const errorResponse = new ErrorResponseDTO(errorMessage);

    return res.status(500).json(errorResponse);
  }
}



