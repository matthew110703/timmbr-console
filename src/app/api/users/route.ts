import { NextRequest, NextResponse } from "next/server";
import { api, API_ROUTES, toBffErrorResponse } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type {
  AdminCreateUserResponse,
  AdminUserListItem,
  CreateAdminUserPayload,
  UserRole,
  UserStatus,
} from "@/app/(console)/users/types";

export const dynamic = "force-dynamic";

const VALID_ROLES: UserRole[] = ["USER", "STAFF", "ADMIN", "MASTER"];
const VALID_STATUSES: UserStatus[] = ["ACTIVE", "DELETED"];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 20;
    const search = searchParams.get("search")?.trim() || undefined;

    const rawRole = searchParams.get("role")?.toUpperCase();
    const role =
      rawRole && VALID_ROLES.includes(rawRole as UserRole)
        ? (rawRole as UserRole)
        : undefined;

    const rawStatus = searchParams.get("status")?.toUpperCase();
    const status =
      rawStatus && VALID_STATUSES.includes(rawStatus as UserStatus)
        ? (rawStatus as UserStatus)
        : undefined;

    const res = await api.get<PaginatedResult<AdminUserListItem>>(
      API_ROUTES.ADMIN.USERS,
      {
        params: {
          page,
          limit,
          search,
          role,
          status,
        },
        cache: "no-store",
      },
    );

    return NextResponse.json(res);
  } catch (err: unknown) {
    return toBffErrorResponse(err, "Failed to fetch users");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateAdminUserPayload;
    const res = await api.post<AdminCreateUserResponse>(
      API_ROUTES.ADMIN.USERS,
      body,
    );
    return NextResponse.json(res, { status: 201 });
  } catch (err: unknown) {
    return toBffErrorResponse(err, "Failed to create user");
  }
}
