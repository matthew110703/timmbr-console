import { NextRequest, NextResponse } from "next/server";
import { api, API_ROUTES, toBffErrorResponse } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type {
  AttributeDefinition,
  AttributeScope,
  AttributeType,
} from "@/app/(console)/attributes/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 20;
    const search = searchParams.get("search") || undefined;
    const rawScope = searchParams.get("scope")?.toUpperCase();
    const scope =
      rawScope && ["PRODUCT", "VARIANT"].includes(rawScope)
        ? (rawScope as AttributeScope)
        : undefined;
    const rawType = searchParams.get("type")?.toUpperCase();
    const type =
      rawType &&
      ["STRING", "LIST", "INTEGER", "DECIMAL", "BOOLEAN"].includes(rawType)
        ? (rawType as AttributeType)
        : undefined;

    // cache: 'no-store' bypasses the Next.js data cache — clients call this endpoint
    // after mutations to get fresh data, so stale cache is not acceptable here.
    const res = await api.get<PaginatedResult<AttributeDefinition>>(
      API_ROUTES.ADMIN.ATTRIBUTE_DEFINITIONS,
      {
        params: { page, limit, search, scope, type },
        cache: "no-store",
      },
    );

    return NextResponse.json(res);
  } catch (err: unknown) {
    return toBffErrorResponse(err, "Failed to fetch attributes");
  }
}
