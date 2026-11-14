"use client";

import React from "react";
import Image from "next/image";
import {
  Button,
  Checkbox,
  Tooltip,
  type ColumnDef,
  type HeaderContext,
  type CellContext,
} from "@timmbr/ui";
import { Package, Pencil, Trash2 } from "lucide-react";
import { strings } from "./strings";
import { ProductStatusBadge } from "./components/ProductStatusBadge";
import type { Product } from "./types";

export interface CreateProductColumnsOptions {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  canWrite?: boolean;
  canDelete?: boolean;
}

export function createProductColumns({
  onEdit,
  onDelete,
  canWrite = true,
  canDelete = true,
}: CreateProductColumnsOptions): ColumnDef<Product>[] {
  return [
    {
      id: "select",
      header: ({ table }: HeaderContext<Product, unknown>) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
            aria-label="Select all products"
          />
        </div>
      ),
      cell: ({ row }: CellContext<Product, unknown>) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(val) => row.toggleSelected(!!val)}
            aria-label={`Select product ${row.original.title}`}
          />
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "title",
      header: strings.table.product,
      cell: ({ row }: CellContext<Product, unknown>) => {
        const product = row.original;
        const cover = product.coverImage?.url;

        return (
          <div className="flex items-center gap-3 min-w-[240px] py-0.5">
            <div className="relative size-10 rounded-lg border border-border/80 bg-muted/40 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
              {cover ? (
                <Image
                  src={cover}
                  alt={product.title}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <Package className="size-4 text-muted-foreground/60" />
              )}
            </div>
            <div className="flex flex-col min-w-0 pr-2">
              <span className="font-semibold text-foreground text-sm leading-tight truncate group-hover:text-primary transition-colors">
                {product.title}
              </span>
              <span className="font-mono text-2xs text-muted-foreground/80 truncate">
                /{product.slug}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "status",
      header: strings.table.status,
      cell: ({ row }: CellContext<Product, unknown>) => (
        <ProductStatusBadge status={row.original.status} />
      ),
    },
    {
      id: "category",
      header: strings.table.category,
      cell: ({ row }: CellContext<Product, unknown>) => {
        const category = row.original.category;
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/50 border border-border/60 text-xs text-foreground/80 font-medium">
            {category ? category.name : "—"}
          </span>
        );
      },
    },
    {
      id: "brand",
      header: strings.table.brand,
      cell: ({ row }: CellContext<Product, unknown>) => {
        const brand = row.original.brand;
        return (
          <span className="text-body-3 text-foreground/90 font-medium">
            {brand ? brand.name : "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: strings.table.created,
      cell: ({ row }: CellContext<Product, unknown>) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">
            {date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right pr-2">{strings.table.actions}</div>
      ),
      cell: ({ row }: CellContext<Product, unknown>) => {
        const product = row.original;
        return (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {!canWrite ? (
              <Tooltip content={strings.permissions.editProductRequired}>
                <span className="inline-flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled
                    aria-label={`Edit ${product.title}`}
                    title={strings.permissions.editProductRequired}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onEdit(product)}
                aria-label={`Edit ${product.title}`}
                title={strings.actions.edit}
              >
                <Pencil className="size-3.5" />
              </Button>
            )}
            {!canDelete ? (
              <Tooltip content={strings.permissions.deleteProductRequired}>
                <span className="inline-flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${product.title}`}
                    title={strings.permissions.deleteProductRequired}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(product)}
                aria-label={`Delete ${product.title}`}
                title={strings.actions.delete}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
  ];
}
