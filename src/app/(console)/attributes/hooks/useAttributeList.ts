"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@timmbr/hooks";
import { toast, type RowSelectionState } from "@timmbr/ui";
import { attributeApi } from "../api";
import { strings } from "../strings";
import type { AttributeDefinition } from "../types";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useAttributeList(
  initialData: AttributeDefinition[],
  initialMeta: PaginationMeta,
) {
  const searchParams = useSearchParams();

  const [attributes, setAttributes] =
    useState<AttributeDefinition[]>(initialData);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [isLoading, setIsLoading] = useState(false);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [scopeFilter, setScopeFilter] = useState<string>(
    searchParams.get("scope")?.toUpperCase() || "ALL",
  );
  const [typeFilter, setTypeFilter] = useState<string>(
    searchParams.get("type")?.toUpperCase() || "ALL",
  );
  const [pageSize, setPageSize] = useState<number>(initialMeta.limit || 20);
  const [currentPage, setCurrentPage] = useState<number>(initialMeta.page || 1);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedScope = useDebounce(scopeFilter, 150);
  const debouncedType = useDebounce(typeFilter, 150);

  const fetchAttributes = useCallback(
    async (params: {
      search?: string;
      scope?: string;
      type?: string;
      page: number;
      limit: number;
    }) => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        query.set("page", String(params.page));
        query.set("limit", String(params.limit));
        if (params.search?.trim()) query.set("search", params.search.trim());
        if (params.scope && params.scope !== "ALL")
          query.set("scope", params.scope);
        if (params.type && params.type !== "ALL")
          query.set("type", params.type);

        const res = await fetch(`/api/attributes?${query.toString()}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
            errData?.message || errData?.error || "Failed to load attributes",
          );
        }
        const json = await res.json();
        if (json.data) {
          setAttributes(json.data);
          setMeta(json.meta);
        }

        const newUrl = query.toString()
          ? `/attributes?${query.toString()}`
          : "/attributes";
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
    fetchAttributes({
      search: debouncedSearch,
      scope: debouncedScope,
      type: debouncedType,
      page: currentPage,
      limit: pageSize,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, debouncedScope, debouncedType, currentPage, pageSize]);

  const handleRefresh = useCallback(() => {
    fetchAttributes({
      search: searchQuery,
      scope: scopeFilter,
      type: typeFilter,
      page: currentPage,
      limit: pageSize,
    });
  }, [
    fetchAttributes,
    searchQuery,
    scopeFilter,
    typeFilter,
    currentPage,
    pageSize,
  ]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setScopeFilter("ALL");
    setTypeFilter("ALL");
    setCurrentPage(1);
  };

  const handlePageChange = (nextPage: number) => setCurrentPage(nextPage);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleBulkDelete = async (
    selectedIds: string[],
    onComplete: () => void,
  ) => {
    const results = await Promise.allSettled(
      selectedIds.map((id) => attributeApi.deleteAttributeDefinition(id)),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const total = selectedIds.length;

    toast.success(strings.bulkDelete.successToast(succeeded, total));
    setRowSelection({});
    onComplete();
    handleRefresh();
  };

  const isFiltered = Boolean(
    searchQuery.trim() || scopeFilter !== "ALL" || typeFilter !== "ALL",
  );

  const selectedCount = Object.keys(rowSelection).filter(
    (k) => rowSelection[k],
  ).length;

  const selectedIds = Object.entries(rowSelection)
    .filter(([, selected]) => selected)
    .map(([id]) => id);

  return {
    attributes,
    meta,
    isLoading,
    rowSelection,
    setRowSelection,
    searchQuery,
    setSearchQuery,
    scopeFilter,
    setScopeFilter,
    typeFilter,
    setTypeFilter,
    pageSize,
    currentPage,
    isFiltered,
    selectedCount,
    selectedIds,
    handleRefresh,
    handleClearFilters,
    handlePageChange,
    handlePageSizeChange,
    handleBulkDelete,
  };
}
