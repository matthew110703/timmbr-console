import { NextRequest, NextResponse } from "next/server";
import { usersApi } from "@/app/(console)/users/api/users";
import { toBffErrorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    userId: string;
  }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    await usersApi.resendInvite(userId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return toBffErrorResponse(err, "Failed to resend invitation");
  }
}
