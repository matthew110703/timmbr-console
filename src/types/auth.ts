export type UserRole = "USER" | "STAFF" | "ADMIN" | "MASTER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  permissions?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  role?: UserRole;
  permissions?: string[];
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
  permissions?: string[];
}

export interface SessionData {
  user: User;
  accessToken: string;
}
