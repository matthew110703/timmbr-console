import Cookies from "js-cookie";
import { api } from "@/lib/api";
import type { User, UserRole } from "@/types/auth";

const ACCESS_TOKEN_COOKIE = "timmbr_access_token";
const USER_STORAGE_KEY = "timmbr_user";

// In-memory token cache for ultra-fast access
let inMemoryAccessToken: string | null = null;

// ── Cookie Helpers (Client-side via js-cookie) ────────────────────────────────

export function getCookie(name: string): string | null {
  return Cookies.get(name) ?? null;
}

export function setCookie(name: string, value: string, days = 7) {
  Cookies.set(name, value, {
    expires: days,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function removeCookie(name: string) {
  Cookies.remove(name, { path: "/" });
}

// ── Token & Session Management ────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  return getCookie(ACCESS_TOKEN_COOKIE);
}

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
  if (token) {
    setCookie(ACCESS_TOKEN_COOKIE, token);
  } else {
    removeCookie(ACCESS_TOKEN_COOKIE);
  }
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user: User | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch {}
}

export function clearAuthSession() {
  inMemoryAccessToken = null;
  removeCookie(ACCESS_TOKEN_COOKIE);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(USER_STORAGE_KEY);
    } catch {}
  }
}

export function isAdminOrMaster(role?: UserRole): boolean {
  return role === "ADMIN" || role === "MASTER";
}

// Connect ApiClient token resolution & unauthorized redirection
api.setTokenGetter(() => getAccessToken());
api.setTokenSetter((newToken) => setAccessToken(newToken));
api.setOnUnauthorized(() => {
  clearAuthSession();
  if (
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login")
  ) {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }
});
