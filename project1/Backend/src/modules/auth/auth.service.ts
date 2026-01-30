import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AuthResponseDTO, UserDataDTO } from "../../shared/DTO/authDTO";
import { onboardUser } from "./auth.repository";



/**
 * Login user
 */
async function setTenant(): Promise<AuthResponseDTO> {
    const tokenTTL = (process.env.JWT_EXPIRES_IN ?? "24h") as NonNullable<SignOptions["expiresIn"]>; //to avoid overload matching issue 
    const jwtSecret = process.env.JWT_SECRET;
    const user = await onboardUser(); 

    if (!user) {
        throw new Error("Invalid tenant");
    }

    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign(
        { sub: user.id },
        jwtSecret,
        { expiresIn: tokenTTL }
    );

    return new AuthResponseDTO(user, token);
}

export default {
    setTenant
};
