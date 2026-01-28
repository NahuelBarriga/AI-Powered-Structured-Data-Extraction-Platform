// Request DTOs
export interface RegisterRequestDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

// Response DTOs
export class AuthResponseDTO {
  token: string;
  user: UserDataDTO;
  expiresIn: string;

  constructor(token: string, user: UserDataDTO, expiresIn: string) {
    this.token = token;
    this.user = user;
    this.expiresIn = expiresIn;
  }
}

export class UserDataDTO {
  id: string;
  email: string;
  name: string;
  createdAt: Date;

  constructor(id: string, email: string, name: string, createdAt: Date) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.createdAt = createdAt;
  }
}
