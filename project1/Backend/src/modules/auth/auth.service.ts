import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../../infra/db/prisma";
import type { JWTPayload } from "../../shared/middlewares/auth.middleware";
import type { RegisterRequestDTO, LoginRequestDTO } from "../../shared/DTO/authDTO";
import { AuthResponseDTO, UserDataDTO } from "../../shared/DTO/authDTO";

const SALT_ROUNDS = 10;

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

    /**
     * Register a new user
     */
    async register(data: RegisterRequestDTO): Promise<AuthResponseDTO> {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
            },
        });

        // Generate token
        const token = this.generateToken(user.id, user.email);

        const userDTO = new UserDataDTO(user.id, user.email, user.name ?? "", user.createdAt);
        return new AuthResponseDTO(token, userDTO, this.JWT_EXPIRES_IN);
    }

    /**
     * Login user
     */
    async login(data: LoginRequestDTO): Promise<AuthResponseDTO> {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new Error("Invalid email or password");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }

        // Generate token
        const token = this.generateToken(user.id, user.email);

        const userDTO = new UserDataDTO(user.id, user.email, user.name ?? "", user.createdAt);
        return new AuthResponseDTO(token, userDTO, this.JWT_EXPIRES_IN);
    }

    /**
     * Hash a password
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    /**
     * Compare password with hash
     */
    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
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
