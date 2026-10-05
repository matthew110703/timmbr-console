/**
 * API version configuration maintained centrally in the client.
 */
export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

/**
 * Centralized static API endpoints matching the timmbr-core backend.
 */
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_VERIFICATION: "/auth/resend-verification",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VALIDATE_TOKEN: "/auth/validate-token",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
  },
  USER: {
    ME: "/user/me",
  },
  ADMIN: {
    USERS: "/admin/users",
    CATEGORIES: "/admin/categories",
  },
  MEDIA: {
    PRESIGNED_URL: "/media/presigned-url",
    URL: "/media/url",
    ROOT: "/media",
  },
} as const;

export type ApiRoutes = typeof API_ROUTES;
