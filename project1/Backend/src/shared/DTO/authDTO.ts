export type { RegisterRequestDTO } from "../types/auth.types";

// Response DTOs
export class AuthResponseDTO {
  user: UserDataDTO;
  jwt: string;

  constructor(user: UserDataDTO, jwt: string) {
    this.user = user;
    this.jwt = jwt;
  }
}

export class UserDataDTO {
  id: string;
  createdAt: Date;
  apiKey: string;

  constructor(id: string, apiKey: string, createdAt: Date) {
    this.id = id;
    this.apiKey = apiKey;
    this.createdAt = createdAt;
  }
}
