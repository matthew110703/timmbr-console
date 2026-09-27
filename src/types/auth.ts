export type UserRole = "USER" | "ADMIN" | "MASTER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  role?: UserRole;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  role: UserRole;
  emailVerified: boolean;
}

export interface SessionData {
  user: User;
  accessToken: string;
}
