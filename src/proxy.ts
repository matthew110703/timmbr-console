import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  isTokenExpired,
  isTokenAuthorized,
} from "@timmbr/utils";
import { API_PREFIX, API_ROUTES } from "@/lib/api/routes";

// Public paths that do not require authentication
const PUBLIC_PATHS = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Ignore static assets, well-known devtools probes, or api calls
  if (
    pathname.startsWith("/.well-known") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const hasValidToken = !!token && !isTokenExpired(token);
  const isAuthorized = hasValidToken && isTokenAuthorized(token);

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  // 1. Handling Public Paths (e.g. /login)
  if (isPublicPath) {
    // If user is already authenticated with an authorized role, redirect to /overview
    if (isAuthorized) {
      const fromParam = request.nextUrl.searchParams.get("from");
      const targetUrl =
        fromParam &&
        fromParam.startsWith("/") &&
        !fromParam.startsWith("/login")
          ? fromParam
          : "/overview";

      return NextResponse.redirect(new URL(targetUrl, request.url));
    }

    // Otherwise, allow access to public auth pages
    return NextResponse.next();
  }

  // 2. Handling Root Path (/)
  if (pathname === "/") {
    if (isAuthorized) {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
    return NextResponse.redirect(new URL("/login?from=/overview", request.url));
  }

  // 3. Handling Protected Administrative Routes (/overview, /orders, /products, etc.)
  if (!hasValidToken) {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (refreshToken) {
      try {
        const apiHost = (
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        )
          .replace(/\/+$/, "")
          .replace(/\/api\/v\d+\/?$/, "");
        const refreshApiUrl = `${apiHost}${API_PREFIX}${API_ROUTES.AUTH.REFRESH}`;
        const refreshResponse = await fetch(refreshApiUrl, {
          method: "POST",
          headers: {
            Cookie: `refreshToken=${refreshToken}`,
          },
        });

        if (refreshResponse.ok) {
          const payload = await refreshResponse.json();
          const newAccessToken =
            payload?.data?.accessToken || payload?.accessToken;

          if (newAccessToken && isTokenAuthorized(newAccessToken)) {
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set("x-pathname", pathname);

            const response = NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            });

            response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
              path: "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            });

            const setCookieHeader = refreshResponse.headers.get("set-cookie");
            if (setCookieHeader) {
              response.headers.set("set-cookie", setCookieHeader);
            }

            return response;
          }
        }
      } catch {
        // Fall through to login redirection if refresh fails
      }
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // If token is valid but the role is unauthorized (e.g. standard "USER" customer)
  if (!isAuthorized) {
    const response = NextResponse.redirect(
      new URL("/login?error=unauthorized", request.url),
    );
    // Clear unauthorized access token
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    return response;
  }

  // 4. Authorized Access - Forward with context headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static build files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets (*.png, *.jpg, *.jpeg, *.svg, *.webp, *.gif, *.ico, *.json)
     * - .well-known (Chrome devtools, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)",
  ],
};
