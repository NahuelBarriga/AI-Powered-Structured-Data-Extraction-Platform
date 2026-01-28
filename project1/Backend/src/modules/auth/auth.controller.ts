import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { ErrorResponseDTO, SuccessResponseDTO } from "../../shared/DTO/resDTO";
import type { RegisterRequestDTO, LoginRequestDTO } from "../../shared/DTO/authDTO";

/**
 * Register a new user
 */
export async function registerController(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body as RegisterRequestDTO;

    // Validate input
    if (!email || !password) {
      const errorResponse = new ErrorResponseDTO(
        "Email and password are required"
      );
      return res.status(400).json(errorResponse);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorResponse = new ErrorResponseDTO("Invalid email format");
      return res.status(400).json(errorResponse);
    }

    // Password validation (minimum 8 characters)
    if (password.length < 8) {
      const errorResponse = new ErrorResponseDTO(
        "Password must be at least 8 characters long"
      );
      return res.status(400).json(errorResponse);
    }

    const authResponse = await authService.register({ email, password, name });
    const successResponse = new SuccessResponseDTO(authResponse);

    return res.status(201).json(successResponse);
  } catch (error) {
    console.error("Registration error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Registration failed";
    const errorResponse = new ErrorResponseDTO(errorMessage);

    // Handle duplicate email
    if (errorMessage.includes("already exists")) {
      return res.status(409).json(errorResponse);
    }

    return res.status(500).json(errorResponse);
  }
}

/**
 * Login user
 */
export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body as LoginRequestDTO;

    // Validate input
    if (!email || !password) {
      const errorResponse = new ErrorResponseDTO(
        "Email and password are required"
      );
      return res.status(400).json(errorResponse);
    }

    const authResponse = await authService.login({ email, password });
    const successResponse = new SuccessResponseDTO(authResponse);

    return res.status(200).json(successResponse);
  } catch (error) {
    console.error("Login error:", error);

    const errorMessage = error instanceof Error ? error.message : "Login failed";
    const errorResponse = new ErrorResponseDTO(errorMessage);

    // Handle invalid credentials
    if (errorMessage.includes("Invalid email or password")) {
      return res.status(401).json(errorResponse);
    }

    return res.status(500).json(errorResponse);
  }
}

/**
 * Get current user profile (protected route)
 */
export async function getMeController(req: Request, res: Response) {
  try {
    if (!req.user) {
      const errorResponse = new ErrorResponseDTO("User not authenticated");
      return res.status(401).json(errorResponse);
    }

    const successResponse = new SuccessResponseDTO(req.user);
    return res.status(200).json(successResponse);
  } catch (error) {
    console.error("Get profile error:", error);

    const errorResponse = new ErrorResponseDTO("Failed to get user profile");
    return res.status(500).json(errorResponse);
  }
}
