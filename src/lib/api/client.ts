import { env } from "@/lib/env";
import { ACCESS_TOKEN_COOKIE } from "@timmbr/utils";
import type { ApiErrorResponse } from "@/types/api";
import { API_ROUTES, API_PREFIX } from "./routes";

export class ApiError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  token?: string;
  skipAuth?: boolean;
  _retry?: boolean;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

interface QueuedRequest {
  resolve: (token: string | null) => void;
  reject: (error: Error) => void;
}

export class ApiClient {
  private baseUrl: string;
  private tokenGetter?: () => string | null | Promise<string | null>;
  private tokenSetter?: (token: string | null) => void | Promise<void>;
  private onUnauthorized?: () => void | Promise<void>;

  // Token refresh state
  private isRefreshing = false;
  private failedQueue: QueuedRequest[] = [];

  constructor(config?: {
    baseUrl?: string;
    tokenGetter?: () => string | null | Promise<string | null>;
    tokenSetter?: (token: string | null) => void | Promise<void>;
    onUnauthorized?: () => void | Promise<void>;
  }) {
    const rawBaseUrl = config?.baseUrl || env.NEXT_PUBLIC_API_URL;
    const cleanHost = rawBaseUrl
      .replace(/\/+$/, "")
      .replace(/\/api\/v\d+\/?$/, "");
    this.baseUrl = `${cleanHost}${API_PREFIX}`;
    this.tokenGetter = config?.tokenGetter;
    this.tokenSetter = config?.tokenSetter;
    this.onUnauthorized = config?.onUnauthorized;
  }

  public setTokenGetter(getter: () => string | null | Promise<string | null>) {
    this.tokenGetter = getter;
  }

  public setTokenSetter(
    setter: (token: string | null) => void | Promise<void>,
  ) {
    this.tokenSetter = setter;
  }

  public setOnUnauthorized(callback: () => void | Promise<void>) {
    this.onUnauthorized = callback;
  }

  private processQueue(error: Error | null, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>,
  ): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Attempts to refresh the access token using the HTTP-only refresh cookie.
   */
  private async executeTokenRefresh(): Promise<string> {
    const refreshUrl = this.buildUrl(API_ROUTES.AUTH.REFRESH);

    const response = await fetch(refreshUrl, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        "Session expired. Please log in again.",
      );
    }

    const payload = await response.json();
    // Support either { success: true, data: { accessToken } } from timmbr-core or direct { accessToken }
    const accessToken: string =
      payload?.data?.accessToken || payload?.accessToken;

    if (!accessToken) {
      throw new ApiError(500, "Malformed refresh token response from server");
    }

    if (this.tokenSetter) {
      await this.tokenSetter(accessToken);
    }

    return accessToken;
  }

  /**
   * Public interface to refresh the access token with mutex locking.
   * If a refresh is already in-flight, returns a Promise waiting for the active refresh.
   */
  public async refreshToken(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        this.failedQueue.push({
          resolve: (token) => {
            if (token) resolve(token);
            else
              reject(
                new ApiError(401, "Session expired. Please log in again."),
              );
          },
          reject,
        });
      });
    }

    this.isRefreshing = true;

    try {
      const newAccessToken = await this.executeTokenRefresh();
      this.processQueue(null, newAccessToken);
      return newAccessToken;
    } catch (refreshError) {
      this.processQueue(refreshError as Error, null);
      if (this.onUnauthorized) {
        await this.onUnauthorized();
      }
      throw refreshError;
    } finally {
      this.isRefreshing = false;
    }
  }

  public async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, body, headers, token, skipAuth, _retry, ...restOptions } =
      options;

    const isAuthRoute =
      endpoint === API_ROUTES.AUTH.LOGIN ||
      endpoint === API_ROUTES.AUTH.REFRESH ||
      endpoint === API_ROUTES.AUTH.LOGOUT;

    const requestHeaders = new Headers(headers);

    if (
      !requestHeaders.has("Content-Type") &&
      body &&
      !(body instanceof FormData)
    ) {
      requestHeaders.set("Content-Type", "application/json");
    }

    // Auth injection
    if (!skipAuth && !isAuthRoute) {
      let resolvedToken = token;
      if (!resolvedToken && this.tokenGetter) {
        resolvedToken = (await this.tokenGetter()) || undefined;
      }

      // Automatically resolve token from server cookies in Next.js Server Components
      if (!resolvedToken && typeof window === "undefined") {
        try {
          const { cookies } = await import("next/headers");
          const cookieStore = await cookies();
          resolvedToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
        } catch {}
      }

      if (resolvedToken && !requestHeaders.has("Authorization")) {
        requestHeaders.set("Authorization", `Bearer ${resolvedToken}`);
      }
    }

    const url = this.buildUrl(endpoint, params);

    let serializedBody: BodyInit | null | undefined = undefined;
    if (body !== undefined && body !== null) {
      serializedBody =
        body instanceof FormData || typeof body === "string"
          ? (body as BodyInit)
          : JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
        body: serializedBody,
        credentials: restOptions.credentials || "include",
      });
    } catch (networkError) {
      throw new ApiError(
        0,
        "Network error: Unable to connect to server",
        networkError,
      );
    }

    // ── 401 Handling & Automatic Refresh Token Mechanism ──
    if (response.status === 401 && !skipAuth && !isAuthRoute && !_retry) {
      // Check for JWT error code from the BE (e.g. TOKEN_EXPIRED, UNAUTHORIZED, TOKEN_INVALID)
      let isJwtError = true;
      try {
        const errorJson = (await response.clone().json()) as ApiErrorResponse;
        if (errorJson?.code) {
          isJwtError =
            errorJson.code === "TOKEN_EXPIRED" ||
            errorJson.code === "UNAUTHORIZED" ||
            errorJson.code === "TOKEN_INVALID";
        }
      } catch {}

      if (isJwtError) {
        try {
          const newAccessToken = await this.refreshToken();
          // Retry original request with the new access token
          return this.request<T>(endpoint, {
            ...options,
            token: newAccessToken,
            _retry: true,
          });
        } catch {
          throw new ApiError(401, "Session expired. Please log in again.");
        }
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      let errorDetails: unknown = null;

      try {
        const errorJson = (await response.json()) as ApiErrorResponse;
        if (Array.isArray(errorJson.message)) {
          errorMessage = errorJson.message.join(", ");
        } else if (typeof errorJson.message === "string") {
          errorMessage = errorJson.message;
        }
        errorDetails = errorJson;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(response.status, errorMessage, errorDetails);
    }

    if (response.status === 204) {
      return null as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const json = await response.json();
      // Seamlessly unwrap { success: true, data: T } from timmbr-core TransformInterceptor
      if (
        json &&
        typeof json === "object" &&
        "data" in json &&
        json.success === true
      ) {
        return json.data as T;
      }
      return json as T;
    }

    return (await response.text()) as unknown as T;
  }

  public get<T = unknown>(
    endpoint: string,
    options?: Omit<RequestOptions, "body">,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  public put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  public patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  public delete<T = unknown>(
    endpoint: string,
    options?: Omit<RequestOptions, "body">,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Default singleton client instance for general usage
export const api = new ApiClient();
