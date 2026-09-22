export type UserRole = "USER" | "ADMIN" | "MASTER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}

export interface SessionData {
  user: User;
  accessToken: string;
}
