"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@timmbr/hooks";
import { toast } from "@timmbr/ui";
import { strings } from "../strings";
import type { PaymentStatus, TransactionListItem } from "../types";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
];

export function useTransactionList(
  initialData: TransactionListItem[],
  initialMeta: PaginationMeta,
) {
  const searchParams = useSearchParams();

  const [transactions, setTransactions] =
    useState<TransactionListItem[]>(initialData);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status")?.toUpperCase() || "ALL",
  );
  const [pageSize, setPageSize] = useState<number>(initialMeta.limit || 20);
  const [currentPage, setCurrentPage] = useState<number>(initialMeta.page || 1);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchTransactions = useCallback(
    async (params: {
      search?: string;
      status: string;
      page: number;
      limit: number;
    }) => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        query.set("page", String(params.page));
        query.set("limit", String(params.limit));
        if (params.search?.trim()) query.set("search", params.search.trim());
        if (params.status && params.status !== "ALL") {
          query.set("status", params.status);
        }

        const res = await fetch(`/api/transactions?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to load transactions");
        const json = await res.json();
        if (json.data) {
          setTransactions(json.data);
          setMeta(json.meta);
        }

        const newUrl = query.toString()
          ? `/transactions?${query.toString()}`
          : "/transactions";
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
    fetchTransactions({
      search: debouncedSearch,
      status: statusFilter,
      page: currentPage,
      limit: pageSize,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, currentPage, pageSize]);

  const handleStatusChange = (value: string) => {
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

  const isFiltered = Boolean(searchQuery.trim() || statusFilter !== "ALL");

  return {
    transactions,
    meta,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    handleStatusChange,
    pageSize,
    isFiltered,
    handleClearFilters,
    handlePageChange,
    handlePageSizeChange,
    statusOptions: PAYMENT_STATUSES,
  };
}
