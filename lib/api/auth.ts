import { api } from "./client";
import type { LoginResponse } from "@/types/auth";

export interface LoginDto {
  email: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginDto): Promise<LoginResponse> => {
    return api.post<LoginResponse>("/auth/login", credentials);
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    return api.post<{ accessToken: string }>("/auth/refresh");
  },

  logout: async (): Promise<void> => {
    return api.post<void>("/auth/logout");
  },
};
