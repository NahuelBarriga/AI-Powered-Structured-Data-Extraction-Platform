export type { RegisterRequestDTO } from "../types/auth.types";

/**
 * Response DTO for authentication operations.
 * Includes authenticated user data and JWT token for subsequent API calls.
 */
export class AuthResponseDTO {
  user: UserDataDTO;
  jwt: string;

  /**
   * Creates an auth response with user data and JWT.
   * @param user - User information DTO
   * @param jwt - JWT token string for authentication
   */
  constructor(user: UserDataDTO, jwt: string) {
    this.user = user;
    this.jwt = jwt;
  }
}

/**
 * DTO containing authenticated user information.
 * Returned with auth response and used throughout the application.
 */
export class UserDataDTO {
  id: string;
  createdAt: Date;
  apiKey: string;

  /**
   * Creates a user data DTO.
   * @param id - User ID
   * @param apiKey - API key for programmatic access
   * @param createdAt - Account creation timestamp
   */
  constructor(id: string, apiKey: string, createdAt: Date) {
    this.id = id;
    this.apiKey = apiKey;
    this.createdAt = createdAt;
  }
}
