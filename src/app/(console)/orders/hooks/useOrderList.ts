"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@timmbr/hooks";
import { toast } from "@timmbr/ui";
import { strings } from "../strings";
import {
  SORT_PRESET_PARAMS,
  type OrderListSortPreset,
} from "../lib/orderTransitions";
import type { AdminOrder, OrderStatus } from "../types";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

function parseSortPreset(raw: string | null): OrderListSortPreset {
  if (
    raw === "oldest" ||
    raw === "highestTotal" ||
    raw === "lowestTotal" ||
    raw === "newest"
  ) {
    return raw;
  }
  return "newest";
}

export function useOrderList(
  initialData: AdminOrder[],
  initialMeta: PaginationMeta,
) {
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<AdminOrder[]>(initialData);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status")?.toUpperCase() || "ALL",
  );
  const [sortPreset, setSortPreset] = useState<OrderListSortPreset>(
    parseSortPreset(searchParams.get("sort")),
  );
  const [pageSize, setPageSize] = useState<number>(initialMeta.limit || 20);
  const [currentPage, setCurrentPage] = useState<number>(initialMeta.page || 1);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchOrders = useCallback(
    async (params: {
      search?: string;
      status: string;
      sort: OrderListSortPreset;
      page: number;
      limit: number;
    }) => {
      setIsLoading(true);
      try {
        const { sortBy, order } = SORT_PRESET_PARAMS[params.sort];
        const query = new URLSearchParams();
        query.set("page", String(params.page));
        query.set("limit", String(params.limit));
        query.set("sortBy", sortBy);
        query.set("order", order);
        if (params.sort !== "newest") query.set("sort", params.sort);
        if (params.search?.trim()) query.set("search", params.search.trim());
        if (params.status && params.status !== "ALL") {
          query.set("status", params.status);
        }

        const res = await fetch(`/api/orders?${query.toString()}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
            errData?.message || errData?.error || "Failed to load orders",
          );
        }
        const json = await res.json();
        if (json.data) {
          setOrders(json.data);
          setMeta(json.meta);
        }

        const newUrl = query.toString()
          ? `/orders?${query.toString()}`
          : "/orders";
        window.history.replaceState(null, "", newUrl);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : strings.toasts.error);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders({
      search: debouncedSearch,
      status: statusFilter,
      sort: sortPreset,
      page: currentPage,
      limit: pageSize,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, sortPreset, currentPage, pageSize]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortPreset(parseSortPreset(value));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setSortPreset("newest");
    setCurrentPage(1);
  };

  const handlePageChange = (nextPage: number) => setCurrentPage(nextPage);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const isFiltered = Boolean(
    searchQuery.trim() || statusFilter !== "ALL" || sortPreset !== "newest",
  );

  return {
    orders,
    meta,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    handleStatusChange,
    sortPreset,
    handleSortChange,
    pageSize,
    isFiltered,
    handleClearFilters,
    handlePageChange,
    handlePageSizeChange,
    statusOptions: ORDER_STATUSES,
  };
}
