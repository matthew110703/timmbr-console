"use client";

import React, { useState, useMemo } from "react";
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
  Tooltip,
  type SortingState,
} from "@timmbr/ui";
import { Plus, Search, Package, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components";
import { usePermission } from "@/components/AuthContext";
import { CONSOLE_PERMISSIONS } from "@/lib/auth/permissions";
import { ProductStatsRow } from "./ProductStatsRow";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { strings } from "../strings";
import { createProductColumns } from "../columns";
import { useProductList, type PaginationMeta } from "../hooks/useProductList";
import type { Product, ProductStats } from "../types";

export interface ProductListViewProps {
  products: Product[];
  stats: ProductStats;
  meta: PaginationMeta;
}

export const ProductListView: React.FC<ProductListViewProps> = ({
  products: initialProducts,
  stats,
  meta: initialMeta,
}) => {
  const router = useRouter();
  const canWrite = usePermission(CONSOLE_PERMISSIONS.CATALOG_WRITE);
  const canDelete = usePermission(CONSOLE_PERMISSIONS.CATALOG_DELETE);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const {
    products,
    meta,
    isLoading,
    rowSelection,
    setRowSelection,
    searchQuery,
    setSearchQuery,
    statusFilter,
    pageSize,
    isFiltered,
    selectedCount,
    selectedIds,
    handleRefresh,
    handleClearFilters,
    handlePageChange,
    handlePageSizeChange,
    handleStatusChange,
  } = useProductList(initialProducts, initialMeta);

  const columns = useMemo(
    () =>
      createProductColumns({
        onEdit: (product) => router.push(`/products/${product.id}`),
        onDelete: setDeletingProduct,
        canWrite,
        canDelete,
      }),
    [router, canWrite, canDelete],
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      <div className="shrink-0">
        <PageHeader
          title={strings.header.title}
          description={strings.header.subtitle}
          action={
            !canWrite ? (
              <Tooltip content={strings.permissions.createProductRequired}>
                <span className="inline-flex">
                  <Button
                    variant="default"
                    size="sm"
                    leftIcon={<Plus className="size-4" />}
                    disabled
                  >
                    {strings.header.newProduct}
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                variant="default"
                size="sm"
                leftIcon={<Plus className="size-4" />}
                onClick={() => {
                  try {
                    sessionStorage.removeItem("timmbr_product_draft_id");
                  } catch {}
                  router.push("/products/new");
                }}
              >
                {strings.header.newProduct}
              </Button>
            )
          }
        />
      </div>

      {/* ── Stat Cards Row ── */}
      <div className="shrink-0">
        <ProductStatsRow stats={stats} />
      </div>

      {/* ── Toolbar: Search & Status Filter ── */}
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
                  <X className="size-3.5" />
                </button>
              ) : null
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
            options={[
              { value: "ALL", label: strings.toolbar.statusFilterAll },
              { value: "ACTIVE", label: strings.toolbar.statusFilterActive },
              { value: "DRAFT", label: strings.toolbar.statusFilterDraft },
              {
                value: "ARCHIVED",
                label: strings.toolbar.statusFilterArchived,
              },
            ]}
            value={statusFilter}
            onValueChange={handleStatusChange}
          />

          {isFiltered && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<X className="size-3" />}
              onClick={handleClearFilters}
            >
              {strings.toolbar.clearFilters}
            </Button>
          )}
        </Inline>
      </Inline>

      {/* ── Bulk Selection Bar ── */}
      {selectedCount > 0 && (
        <Inline
          justify="between"
          align="center"
          className="shrink-0 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl"
        >
          <span className="text-body-3 font-semibold text-primary">
            {strings.table.bulkSelected(selectedCount)}
          </span>
          <Inline gap={2} align="center">
            {!canDelete ? (
              <Tooltip content={strings.permissions.deleteProductRequired}>
                <span className="inline-flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    disabled
                    aria-label={strings.toolbar.deleteSelected}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setBulkDeleteOpen(true)}
                title={strings.toolbar.deleteSelected}
                aria-label={strings.toolbar.deleteSelected}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
            >
              {strings.toolbar.deselectAll}
            </Button>
          </Inline>
        </Inline>
      )}

      {/* ── Products Table ── */}
      {products.length === 0 && !isLoading ? (
        <Card
          variant="subtle"
          className="flex-1 min-h-[260px] flex items-center justify-center border border-dashed border-border rounded-2xl bg-card"
        >
          <EmptyState
            fullWidth
            icon={<Package className="size-8 text-primary" />}
            title="No Products Found"
            description={
              isFiltered
                ? strings.table.noProductsFiltered
                : strings.table.noProducts
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
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  leftIcon={<Plus className="size-4" />}
                  onClick={() => {
                    try {
                      sessionStorage.removeItem("timmbr_product_draft_id");
                    } catch {}
                    router.push("/products/new");
                  }}
                >
                  {strings.header.newProduct}
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
          <DataTable
            data={products}
            columns={columns}
            sorting={sorting}
            onSortingChange={setSorting}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            stickyHeader
            containerClassName="flex-1 min-h-0 h-full overflow-auto border-0 rounded-none"
            onRowClick={(row) => router.push(`/products/${row.original.id}`)}
            emptyMessage={
              <div className="p-8 text-center text-muted-foreground">
                {strings.table.noProductsFiltered}
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

      {/* ── Single Delete Confirmation ── */}
      <DeleteProductDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        product={deletingProduct}
        onSuccess={handleRefresh}
      />

      {/* ── Bulk Delete Confirmation ── */}
      <DeleteProductDialog
        open={bulkDeleteOpen}
        onOpenChange={(open) => {
          setBulkDeleteOpen(open);
        }}
        selectedIds={selectedIds}
        onSuccess={() => {
          setRowSelection({});
          setBulkDeleteOpen(false);
          handleRefresh();
        }}
      />
    </div>
  );
};
