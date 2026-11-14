import { NextResponse } from "next/server";
import { ApiError } from "./client";

export function toBffErrorResponse(
  err: unknown,
  fallbackMessage: string,
): NextResponse {
  const status =
    err instanceof ApiError && err.statusCode >= 100 && err.statusCode < 600
      ? err.statusCode
      : 500;

  const details =
    err instanceof ApiError &&
    err.details &&
    typeof err.details === "object" &&
    !Array.isArray(err.details)
      ? (err.details as Record<string, unknown>)
      : null;

  const message =
    err instanceof Error && err.message ? err.message : fallbackMessage;

  const code =
    typeof details?.code === "string"
      ? details.code
      : status === 403
        ? "INSUFFICIENT_PERMISSIONS"
        : status === 401
          ? "UNAUTHORIZED"
          : "INTERNAL_SERVER_ERROR";

  return NextResponse.json(
    {
      ...(details ?? {}),
      success: false,
      statusCode: status,
      code,
      message,
      error: message,
    },
    { status },
  );
}
