"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@timmbr/hooks";
import { toast } from "@timmbr/ui";
import { strings } from "@/app/(console)/users/strings";
import type {
  AdminUserListItem,
  UserStatus,
} from "@/app/(console)/users/types";
import type { PaginationMeta } from "@/app/(console)/transactions/hooks/useTransactionList";

export type RoleFilterValue = "ALL" | "USER" | "STAFF" | "ADMIN";
export type StatusFilterValue = "ALL" | UserStatus;

export function useUserList(
  initialData: AdminUserListItem[],
  initialMeta: PaginationMeta,
) {
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<AdminUserListItem[]>(initialData);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [roleFilter, setRoleFilter] = useState<RoleFilterValue>(() => {
    const r = searchParams.get("role")?.toUpperCase();
    if (r === "USER" || r === "STAFF" || r === "ADMIN") return r;
    return "ALL";
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(() => {
    const s = searchParams.get("status")?.toUpperCase();
    if (s === "ACTIVE" || s === "DELETED") return s;
    return "ALL";
  });
  const [pageSize, setPageSize] = useState<number>(initialMeta.limit || 20);
  const [currentPage, setCurrentPage] = useState<number>(initialMeta.page || 1);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isFirstRender = useRef(true);

  const fetchUsers = useCallback(
    async (params: {
      search?: string;
      role: RoleFilterValue;
      status: StatusFilterValue;
      page: number;
      limit: number;
    }) => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        query.set("page", String(params.page));
        query.set("limit", String(params.limit));
        if (params.search?.trim()) query.set("search", params.search.trim());
        if (params.role && params.role !== "ALL") {
          query.set("role", params.role);
        }
        if (params.status && params.status !== "ALL") {
          query.set("status", params.status);
        }

        const res = await fetch(`/api/users?${query.toString()}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
            errData?.message || errData?.error || "Failed to load users",
          );
        }
        const json = await res.json();
        if (json.data) {
          setUsers(json.data);
          setMeta(json.meta);
        }

        const newUrl = query.toString()
          ? `/users?${query.toString()}`
          : "/users";
        window.history.replaceState(null, "", newUrl);
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : strings.toasts.fetchError,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    // Avoid double fetching initial server rendered data on first mount if unchanged
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    fetchUsers({
      search: debouncedSearch,
      role: roleFilter,
      status: statusFilter,
      page: currentPage,
      limit: pageSize,
    });
  }, [
    debouncedSearch,
    roleFilter,
    statusFilter,
    currentPage,
    pageSize,
    fetchUsers,
  ]);

  const handleRoleChange = (value: RoleFilterValue) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: StatusFilterValue) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  const handlePageChange = (nextPage: number) => setCurrentPage(nextPage);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const refresh = useCallback(() => {
    fetchUsers({
      search: debouncedSearch,
      role: roleFilter,
      status: statusFilter,
      page: currentPage,
      limit: pageSize,
    });
  }, [
    debouncedSearch,
    roleFilter,
    statusFilter,
    currentPage,
    pageSize,
    fetchUsers,
  ]);

  const isFiltered = Boolean(searchQuery.trim() || statusFilter !== "ALL");

  return {
    users,
    meta,
    isLoading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    handleRoleChange,
    statusFilter,
    handleStatusChange,
    pageSize,
    isFiltered,
    handleClearFilters,
    handlePageChange,
    handlePageSizeChange,
    refresh,
  };
}
