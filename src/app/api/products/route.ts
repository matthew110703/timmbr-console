import { NextRequest, NextResponse } from "next/server";
import { productApi } from "@/app/(console)/products/api";
import type { ProductStatus } from "@/app/(console)/products/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 10;
    const search = searchParams.get("search") || undefined;
    const rawStatus = searchParams.get("status")?.toUpperCase();
    const status =
      rawStatus && ["ACTIVE", "DRAFT", "ARCHIVED"].includes(rawStatus)
        ? (rawStatus as ProductStatus)
        : undefined;
    const sortBy = searchParams.get("sortBy") || undefined;
    const order = (searchParams.get("order") as "asc" | "desc") || undefined;

    const res = await productApi.getProducts({
      page,
      limit,
      search,
      status,
      sortBy,
      order,
    });

    return NextResponse.json(res);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
