import { env } from "@/lib/env";
import type { ApiErrorResponse } from "@/types/api";

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
}

export class ApiClient {
  private baseUrl: string;
  private tokenGetter?: () => string | null | Promise<string | null>;
  private onUnauthorized?: () => void | Promise<void>;

  constructor(config?: {
    baseUrl?: string;
    tokenGetter?: () => string | null | Promise<string | null>;
    onUnauthorized?: () => void | Promise<void>;
  }) {
    this.baseUrl = config?.baseUrl || env.NEXT_PUBLIC_API_URL;
    this.tokenGetter = config?.tokenGetter;
    this.onUnauthorized = config?.onUnauthorized;
  }

  public setTokenGetter(getter: () => string | null | Promise<string | null>) {
    this.tokenGetter = getter;
  }

  public setOnUnauthorized(callback: () => void | Promise<void>) {
    this.onUnauthorized = callback;
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

  public async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, body, headers, token, skipAuth, ...restOptions } = options;

    const requestHeaders = new Headers(headers);

    if (
      !requestHeaders.has("Content-Type") &&
      body &&
      !(body instanceof FormData)
    ) {
      requestHeaders.set("Content-Type", "application/json");
    }

    // Auth injection
    if (!skipAuth) {
      let resolvedToken = token;
      if (!resolvedToken && this.tokenGetter) {
        resolvedToken = (await this.tokenGetter()) || undefined;
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

    if (response.status === 401 && this.onUnauthorized) {
      await this.onUnauthorized();
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
      return (await response.json()) as T;
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
