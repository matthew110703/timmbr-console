"use client";

import React from "react";
import {
  Button,
  Badge,
  Checkbox,
  Stack,
  Inline,
  type ColumnDef,
  type HeaderContext,
  type CellContext,
} from "@timmbr/ui";
import { Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { strings } from "./strings";
import { getBadgeConfigForType, getScopeBadgeConfig } from "./helpers";
import type { AttributeDefinition } from "./types";

interface CreateAttributeColumnsOptions {
  onEdit: (attr: AttributeDefinition) => void;
  onDelete: (attr: AttributeDefinition) => void;
}

export function createAttributeColumns({
  onEdit,
  onDelete,
}: CreateAttributeColumnsOptions): ColumnDef<AttributeDefinition>[] {
  return [
    {
      id: "select",
      header: ({ table }: HeaderContext<AttributeDefinition, unknown>) => (
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
            aria-label="Select all attributes"
          />
        </div>
      ),
      cell: ({ row }: CellContext<AttributeDefinition, unknown>) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(val) => row.toggleSelected(!!val)}
            aria-label={`Select attribute ${row.original.name}`}
          />
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: strings.table.name,
      cell: ({ row }: CellContext<AttributeDefinition, unknown>) => {
        const attr = row.original;
        return (
          <Stack gap={0.5} className="py-1">
            <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
              {attr.name}
            </span>
            {attr.unit && (
              <span className="text-xs text-muted-foreground/80 font-mono">
                Unit: {attr.unit}
              </span>
            )}
          </Stack>
        );
      },
    },
    {
      accessorKey: "key",
      header: strings.table.key,
      cell: ({ row }: CellContext<AttributeDefinition, unknown>) => {
        const key = row.original.key;
        return key ? (
          <code className="text-xs px-2 py-0.5 rounded-md bg-muted/70 text-foreground font-mono border border-border/80">
            {key}
          </code>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "type",
      header: strings.table.type,
      cell: ({ row }: CellContext<AttributeDefinition, unknown>) => {
        const config = getBadgeConfigForType(row.original.type);
        return (
          <Badge
            variant={config.variant}
            size="sm"
            className={config.className}
          >
            {row.original.type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "scope",
      header: strings.table.scope,
      cell: ({ row }: CellContext<AttributeDefinition, unknown>) => {
        const config = getScopeBadgeConfig(row.original.scope);
        return (
          <Badge
            variant={config.variant}
            size="sm"
            className={config.className}
          >
            {row.original.scope}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isFilterable",
      header: strings.table.filterable,
      cell: ({ row }: CellContext<AttributeDefinition, unknown>) => {
        const isFilterable = row.original.isFilterable;
        return isFilterable ? (
          <Inline
            gap={1.5}
            align="center"
            className="text-xs text-emerald-700 dark:text-emerald-400 font-medium"
          >
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>{strings.table.yes}</span>
          </Inline>
        ) : (
          <Inline
            gap={1.5}
            align="center"
            className="text-xs text-muted-foreground"
          >
            <XCircle className="size-3.5 opacity-60" />
            <span>{strings.table.no}</span>
          </Inline>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right pr-2">{strings.table.actions}</div>
      ),
      cell: ({ row }: CellContext<AttributeDefinition, unknown>) => {
        const attr = row.original;
        return (
          <div
            className="flex items-center justify-start gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onEdit(attr)}
              aria-label={`Edit ${attr.name}`}
              title="Edit attribute definition"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(attr)}
              aria-label={`Delete ${attr.name}`}
              title="Delete attribute definition"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];
}
