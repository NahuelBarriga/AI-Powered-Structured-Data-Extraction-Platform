import jwt from "jsonwebtoken";
import type { JWTPayload } from "../../shared/middlewares/auth.middleware";

export class AuthService {
    private readonly JWT_SECRET: string;
    private readonly JWT_EXPIRES_IN: string;

    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || "";
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

        if (!this.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not set");
        }
    }


    // Generate JWT

    generateToken(userId: string, email: string): string {
        const payload: Omit<JWTPayload, "iat" | "exp"> = {
            userId,
            email,
        };

        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN,
        } as jwt.SignOptions);
    }

    // verify and decode JWT

    verifyToken(token: string): JWTPayload {
        return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    }

    // decode token without verification //!(debugging)
    decodeToken(token: string): JWTPayload | null {
        return jwt.decode(token) as JWTPayload | null;
    }
}

export const authService = new AuthService();
