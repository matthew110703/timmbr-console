import { api, API_ROUTES, ApiError } from "@/lib/api";
import type { LoginResponse, User, UserProfile } from "@/types/auth";
import { parseJwt } from "@/lib/auth/jwt";
import {
  getAccessToken,
  setAccessToken,
  setUser,
  clearAuthSession,
  isAdminOrMaster,
} from "./session";

export interface LoginDto {
  email: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginDto): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>(
      API_ROUTES.AUTH.LOGIN,
      credentials,
      {
        skipAuth: true,
      },
    );

    // Resolve role from response or decoded JWT payload as fallback
    let role = res.role;
    if (!role && res.accessToken) {
      const decoded = parseJwt(res.accessToken);
      if (decoded?.role) {
        role = decoded.role;
      }
    }

    // Enforce Role-Based Access Control (RBAC): Only ADMIN and MASTER can log in to the Console
    if (!isAdminOrMaster(role)) {
      // Immediately revoke/logout from the customer session
      try {
        await api.post<void>(API_ROUTES.AUTH.LOGOUT, undefined, {
          skipAuth: true,
        });
      } catch {}
      clearAuthSession();
      throw new ApiError(
        403,
        "Access denied. Only administrators and master accounts can access the Timmbr Console.",
      );
    }

    setAccessToken(res.accessToken);
    setUser({
      id: res.id,
      name: res.name,
      email: res.email,
      role: role,
      emailVerified: res.emailVerified,
    });

    return { ...res, role };
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const accessToken = await api.refreshToken();
    return { accessToken };
  },

  logout: async (): Promise<void> => {
    try {
      await api.post<void>(API_ROUTES.AUTH.LOGOUT, undefined, {
        skipAuth: true,
      });
    } finally {
      clearAuthSession();
    }
  },

  getProfile: async (token?: string): Promise<UserProfile | null> => {
    try {
      const resolvedToken =
        token || (typeof window !== "undefined" ? getAccessToken() : null);

      const profile = await api.get<UserProfile>(API_ROUTES.USER.ME, {
        token: resolvedToken || undefined,
        next: { revalidate: 60, tags: ["user-profile"] },
      });

      if (profile) {
        if (!profile.role && resolvedToken) {
          const decoded = parseJwt(resolvedToken);
          if (decoded?.role) {
            profile.role = decoded.role;
          }
        }
        if (typeof window !== "undefined") {
          setUser(profile as unknown as User);
        }
      }
      return profile;
    } catch {
      return null;
    }
  },
};
