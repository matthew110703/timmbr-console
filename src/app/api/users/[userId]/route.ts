import { NextRequest, NextResponse } from "next/server";
import { api, API_ROUTES, toBffErrorResponse } from "@/lib/api";
import type {
  AdminUserListItem,
  UpdateAdminUserPayload,
} from "@/app/(console)/users/types";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    userId: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    const res = await api.get<AdminUserListItem>(
      `${API_ROUTES.ADMIN.USERS}/${userId}`,
      { cache: "no-store" },
    );
    return NextResponse.json(res);
  } catch (err: unknown) {
    return toBffErrorResponse(err, "Failed to fetch user");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    const body = (await request.json()) as UpdateAdminUserPayload;
    const res = await api.patch<AdminUserListItem>(
      `${API_ROUTES.ADMIN.USERS}/${userId}`,
      body,
    );
    return NextResponse.json(res);
  } catch (err: unknown) {
    return toBffErrorResponse(err, "Failed to update user");
  }
}
