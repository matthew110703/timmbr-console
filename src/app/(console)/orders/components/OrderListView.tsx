"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  DataTable,
  TablePagination,
  Button,
  Input,
  Select,
  Card,
  EmptyState,
  Inline,
} from "@timmbr/ui";
import { Search, ShoppingBag, X } from "lucide-react";
import { PageHeader } from "@/components";
import { strings } from "../strings";
import { createOrderColumns } from "../columns";
import { useOrderList, type PaginationMeta } from "../hooks/useOrderList";
import type { AdminOrder } from "../types";

export interface OrderListViewProps {
  initialData: AdminOrder[];
  meta: PaginationMeta;
}

export const OrderListView: React.FC<OrderListViewProps> = ({
  initialData,
  meta: initialMeta,
}) => {
  const router = useRouter();

  const {
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
    statusOptions,
    handleClearFilters,
    handlePageChange,
    handlePageSizeChange,
  } = useOrderList(initialData, initialMeta);

  const columns = useMemo(() => createOrderColumns(), []);

  const statusSelectOptions = useMemo(
    () => [
      { value: "ALL", label: strings.toolbar.statusFilterAll },
      ...statusOptions.map((s) => ({
        value: s,
        label: strings.orderStatus[s],
      })),
    ],
    [statusOptions],
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      <div className="shrink-0">
        <PageHeader
          title={strings.header.title}
          description={strings.header.subtitle}
        />
      </div>

      <Inline
        gap={3}
        align="center"
        wrap
        justify="between"
        className="shrink-0"
      >
        <div className="relative min-w-0 flex-1 basis-full sm:basis-auto sm:max-w-md">
          <Input
            placeholder={strings.toolbar.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            leftAdornment={<Search className="size-4 text-muted-foreground" />}
            rightAdornment={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              ) : undefined
            }
          />
        </div>

        <Inline gap={2} wrap align="center" className="shrink-0">
          <Select
            containerClassName="w-44 shrink-0"
            className={
              statusFilter !== "ALL"
                ? "border-primary ring-1 ring-primary/20 shadow-xs"
                : undefined
            }
            options={statusSelectOptions}
            value={statusFilter}
            onValueChange={handleStatusChange}
          />
          <Select
            containerClassName="w-44 shrink-0"
            className={
              sortPreset !== "newest"
                ? "border-primary ring-1 ring-primary/20 shadow-xs"
                : undefined
            }
            options={[
              { value: "newest", label: strings.toolbar.sortNewest },
              { value: "oldest", label: strings.toolbar.sortOldest },
              {
                value: "highestTotal",
                label: strings.toolbar.sortHighestTotal,
              },
              { value: "lowestTotal", label: strings.toolbar.sortLowestTotal },
            ]}
            value={sortPreset}
            onValueChange={handleSortChange}
          />
          {isFiltered ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              leftIcon={<X className="size-4" />}
            >
              {strings.toolbar.clearFilters}
            </Button>
          ) : null}
        </Inline>
      </Inline>

      {orders.length === 0 && !isLoading ? (
        <Card
          variant="subtle"
          className="flex-1 min-h-[260px] flex items-center justify-center border border-dashed border-border rounded-2xl bg-card"
        >
          <EmptyState
            fullWidth
            icon={<ShoppingBag className="size-8 text-primary" />}
            title={strings.table.emptyTitle}
            description={
              isFiltered ? strings.table.emptyFiltered : strings.table.empty
            }
            action={
              isFiltered ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  leftIcon={<X className="size-4" />}
                >
                  {strings.toolbar.clearFilters}
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
          <DataTable
            data={orders}
            columns={columns}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            stickyHeader
            containerClassName="flex-1 min-h-0 h-full overflow-auto border-0 rounded-none [&_tbody_tr]:transition-colors [&_tbody_tr]:hover:bg-muted/40"
            onRowClick={(row) => router.push(`/orders/${row.original.id}`)}
            emptyMessage={
              <div className="p-8 text-center text-muted-foreground">
                {strings.table.emptyFiltered}
              </div>
            }
          />

          <TablePagination
            className="shrink-0 bg-card border-t border-border"
            page={meta.page}
            totalPages={meta.totalPages}
            totalItems={meta.total}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}
    </div>
  );
};
