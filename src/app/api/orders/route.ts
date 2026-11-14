import { NextRequest, NextResponse } from "next/server";
import { api, API_ROUTES, toBffErrorResponse } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type {
  AdminOrder,
  AdminOrderSortField,
  OrderSortDirection,
  OrderStatus,
} from "@/app/(console)/orders/types";

export const dynamic = "force-dynamic";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

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
    const rawStatus = searchParams.get("status");
    const status = rawStatus
      ? rawStatus
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter((s): s is OrderStatus =>
            ORDER_STATUSES.includes(s as OrderStatus),
          )
      : undefined;

    const rawSortBy = searchParams.get("sortBy")?.trim();
    const sortFields: AdminOrderSortField[] = [
      "createdAt",
      "placedAt",
      "grandTotal",
    ];
    const sortBy =
      rawSortBy && sortFields.includes(rawSortBy as AdminOrderSortField)
        ? (rawSortBy as AdminOrderSortField)
        : undefined;
    const rawOrder = searchParams.get("order")?.trim().toLowerCase();
    const order: OrderSortDirection | undefined =
      rawOrder === "asc" || rawOrder === "desc" ? rawOrder : undefined;

    const res = await api.get<PaginatedResult<AdminOrder>>(
      API_ROUTES.ADMIN.ORDERS,
      {
        params: {
          page,
          limit,
          search,
          status: status?.length ? status.join(",") : undefined,
          sortBy,
          order,
        },
        cache: "no-store",
      },
    );

    return NextResponse.json(res);
  } catch (err: unknown) {
    return toBffErrorResponse(err, "Failed to fetch orders");
  }
}
