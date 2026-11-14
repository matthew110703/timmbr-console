import React from "react";
import { safeApiCall } from "@timmbr/utils";
import { UserListView } from "@/components";
import { usersApi } from "./api/users";
import { strings } from "./strings";
import type { UserRole, UserStatus } from "./types";

export const metadata = {
  title: strings.metadata.title,
  description: strings.metadata.description,
};

const PAGE_LIMIT = 20;

const DEFAULT_META = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const VALID_ROLES: UserRole[] = ["USER", "STAFF", "ADMIN", "MASTER"];
const VALID_STATUSES: UserStatus[] = ["ACTIVE", "DELETED"];

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    status?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const rawRole = params.role?.toUpperCase();
  const role =
    rawRole && VALID_ROLES.includes(rawRole as UserRole)
      ? (rawRole as UserRole)
      : undefined;

  const rawStatus = params.status?.toUpperCase();
  const status =
    rawStatus && VALID_STATUSES.includes(rawStatus as UserStatus)
      ? (rawStatus as UserStatus)
      : undefined;

  const search = params.search?.trim() || undefined;

  const res = await safeApiCall(
    () =>
      usersApi.getUsers({
        page,
        limit: PAGE_LIMIT,
        role,
        status,
        search,
      }),
    { data: [], meta: DEFAULT_META },
    "[UsersPage]",
  );

  return <UserListView initialData={res.data} meta={res.meta} />;
}
