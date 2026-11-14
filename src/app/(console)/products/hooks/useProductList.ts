"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@timmbr/hooks";
import { toast, type RowSelectionState } from "@timmbr/ui";
import { strings } from "../strings";
import type { Product, ProductStatus } from "../types";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useProductList(
  initialData: Product[],
  initialMeta: PaginationMeta,
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>(initialData);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [isLoading, setIsLoading] = useState(false);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status")?.toUpperCase() || "ALL",
  );
  const [pageSize, setPageSize] = useState<number>(initialMeta.limit || 10);
  const [currentPage, setCurrentPage] = useState<number>(initialMeta.page || 1);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedStatus = useDebounce(statusFilter, 150);

  const fetchProducts = useCallback(
    async (params: {
      search?: string;
      status?: string;
      page: number;
      limit: number;
    }) => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        query.set("page", String(params.page));
        query.set("limit", String(params.limit));
        if (params.search?.trim()) query.set("search", params.search.trim());
        if (params.status && params.status !== "ALL")
          query.set("status", params.status);

        const res = await fetch(`/api/products?${query.toString()}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
            errData?.message || errData?.error || "Failed to load products",
          );
        }
        const json = (await res.json()) as {
          data: Product[];
          meta: PaginationMeta;
        };
        if (json.data) {
          setProducts(json.data);
          setMeta(json.meta);
        }

        const newUrl = query.toString()
          ? `/products?${query.toString()}`
          : "/products";
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
    fetchProducts({
      search: debouncedSearch,
      status: debouncedStatus,
      page: currentPage,
      limit: pageSize,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, debouncedStatus, currentPage, pageSize]);

  const handleRefresh = useCallback(() => {
    fetchProducts({
      search: searchQuery,
      status: statusFilter,
      page: currentPage,
      limit: pageSize,
    });
    router.refresh();
  }, [fetchProducts, searchQuery, statusFilter, currentPage, pageSize, router]);

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

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus as ProductStatus | "ALL");
    setCurrentPage(1);
  };

  const isFiltered = Boolean(searchQuery.trim() || statusFilter !== "ALL");

  const selectedCount = Object.keys(rowSelection).filter(
    (k) => rowSelection[k],
  ).length;

  const selectedIds = Object.entries(rowSelection)
    .filter(([, selected]) => selected)
    .map(([id]) => id);

  return {
    products,
    meta,
    isLoading,
    rowSelection,
    setRowSelection,
    searchQuery,
    setSearchQuery,
    statusFilter,
    pageSize,
    currentPage,
    isFiltered,
    selectedCount,
    selectedIds,
    handleRefresh,
    handleClearFilters,
    handlePageChange,
    handlePageSizeChange,
    handleStatusChange,
  };
}
