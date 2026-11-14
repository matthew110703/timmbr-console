import { NextRequest, NextResponse } from "next/server";
import { api, API_ROUTES, toBffErrorResponse } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type {
  PaymentStatus,
  TransactionListItem,
} from "@/app/(console)/transactions/types";

export const dynamic = "force-dynamic";

const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
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
          .filter((s): s is PaymentStatus =>
            PAYMENT_STATUSES.includes(s as PaymentStatus),
          )
      : undefined;

    const res = await api.get<PaginatedResult<TransactionListItem>>(
      API_ROUTES.ADMIN.TRANSACTIONS,
      {
        params: {
          page,
          limit,
          search,
          status: status?.length ? status.join(",") : undefined,
        },
        cache: "no-store",
      },
    );

    return NextResponse.json(res);
  } catch (err: unknown) {
    return toBffErrorResponse(err, "Failed to fetch transactions");
  }
}
