"use client";

import React, { useState, useMemo } from "react";
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
import { Plus, Search, SlidersHorizontal, X, Trash2 } from "lucide-react";
import { PageHeader } from "@/components";
import { usePermission } from "@/components/AuthContext";
import { CONSOLE_PERMISSIONS } from "@/lib/auth/permissions";
import { NewAttributeDialog } from "./NewAttributeDialog";
import { AttributeDetailView } from "./AttributeDetailView";
import { DeleteAttributeDialog } from "./DeleteAttributeDialog";
import { strings } from "../strings";
import { createAttributeColumns } from "../columns";
import {
  useAttributeList,
  type PaginationMeta,
} from "../hooks/useAttributeList";
import type { AttributeDefinition } from "../types";

export interface AttributeListViewProps {
  initialData: AttributeDefinition[];
  meta: PaginationMeta;
}

export const AttributeListView: React.FC<AttributeListViewProps> = ({
  initialData,
  meta: initialMeta,
}) => {
  const canWrite = usePermission(CONSOLE_PERMISSIONS.CATALOG_WRITE);
  const canDelete = usePermission(CONSOLE_PERMISSIONS.CATALOG_DELETE);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<AttributeDefinition | null>(
    null,
  );
  const [deletingAttr, setDeletingAttr] = useState<AttributeDefinition | null>(
    null,
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const {
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
    isFiltered,
    selectedCount,
    selectedIds,
    handleRefresh,
    handleClearFilters,
    handlePageChange,
    handlePageSizeChange,
  } = useAttributeList(initialData, initialMeta);

  const columns = useMemo(
    () =>
      createAttributeColumns({
        onEdit: setEditingAttr,
        onDelete: setDeletingAttr,
        canWrite,
        canDelete,
      }),
    [canWrite, canDelete],
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      <div className="shrink-0">
        <PageHeader
          title={strings.header.title}
          description={strings.header.subtitle}
          action={
            !canWrite ? (
              <Tooltip content={strings.permissions.createAttributeRequired}>
                <span className="inline-flex">
                  <Button
                    variant="default"
                    size="sm"
                    leftIcon={<Plus className="size-4" />}
                    disabled
                  >
                    {strings.header.newAttribute}
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                variant="default"
                size="sm"
                leftIcon={<Plus className="size-4" />}
                onClick={() => setIsNewOpen(true)}
              >
                {strings.header.newAttribute}
              </Button>
            )
          }
        />
      </div>

      {/* ── Toolbar: Search & Filters ── */}
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
            containerClassName="w-36 shrink-0"
            className={
              scopeFilter !== "ALL"
                ? "border-primary ring-1 ring-primary/20 shadow-xs"
                : undefined
            }
            options={[
              { value: "ALL", label: strings.toolbar.scopeFilterAll },
              { value: "PRODUCT", label: strings.toolbar.scopeProduct },
              { value: "VARIANT", label: strings.toolbar.scopeVariant },
            ]}
            value={scopeFilter}
            onValueChange={(val) => setScopeFilter(val)}
          />

          <Select
            containerClassName="w-36 shrink-0"
            className={
              typeFilter !== "ALL"
                ? "border-primary ring-1 ring-primary/20 shadow-xs"
                : undefined
            }
            options={[
              { value: "ALL", label: strings.toolbar.typeFilterAll },
              { value: "STRING", label: "String" },
              { value: "LIST", label: "List (Options)" },
              { value: "INTEGER", label: "Integer" },
              { value: "DECIMAL", label: "Decimal" },
              { value: "BOOLEAN", label: "Boolean" },
            ]}
            value={typeFilter}
            onValueChange={(val) => setTypeFilter(val)}
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
            {strings.toolbar.selectedCount(selectedCount)}
          </span>
          <Inline gap={2} align="center">
            {!canDelete ? (
              <Tooltip content={strings.permissions.deleteAttributeRequired}>
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

      {/* ── Attributes Table Card ── */}
      {attributes.length === 0 && !isLoading ? (
        <Card
          variant="subtle"
          className="flex-1 min-h-[260px] flex items-center justify-center border border-dashed border-border rounded-2xl bg-card"
        >
          <EmptyState
            fullWidth
            icon={<SlidersHorizontal className="size-8 text-primary" />}
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
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  leftIcon={<Plus className="size-4" />}
                  onClick={() => setIsNewOpen(true)}
                >
                  {strings.header.newAttribute}
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
          <DataTable
            data={attributes}
            columns={columns}
            sorting={sorting}
            onSortingChange={setSorting}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            stickyHeader
            containerClassName="flex-1 min-h-0 h-full overflow-auto border-0 rounded-none"
            onRowClick={(row) => setEditingAttr(row.original)}
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

      {/* ── New Attribute Dialog ── */}
      <NewAttributeDialog
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
        onSuccess={handleRefresh}
      />

      {/* ── Edit Detail Drawer ── */}
      <AttributeDetailView
        open={!!editingAttr}
        onOpenChange={(open) => !open && setEditingAttr(null)}
        definition={editingAttr}
        onSuccess={handleRefresh}
        readOnly={!canWrite}
      />

      {/* ── Single Delete Confirmation ── */}
      <DeleteAttributeDialog
        open={!!deletingAttr}
        onOpenChange={(open) => !open && setDeletingAttr(null)}
        attribute={deletingAttr}
        onSuccess={handleRefresh}
      />

      {/* ── Bulk Delete Confirmation ── */}
      <DeleteAttributeDialog
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
