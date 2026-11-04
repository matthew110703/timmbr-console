"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Stack,
  DataTable,
  Input,
  Text,
  Badge,
  Inline,
  toast,
  type ColumnDef,
} from "@timmbr/ui";
import { Package, ShieldCheck, ShoppingCart } from "lucide-react";
import { productApi } from "../api";
import { strings } from "../strings";
import { useProductWorkspace } from "./ProductWorkspaceContext";
import type { InventoryRecord, ProductVariant } from "../types";

type InventoryRow = ProductVariant & {
  inventory?: InventoryRecord;
  draftQty?: number;
};

export const InventoryTab: React.FC = () => {
  const { productId, setVariants, setTabDirty, registerSaveHandler } =
    useProductWorkspace();

  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const load = async () => {
      setLoading(true);
      try {
        const list = await productApi.getVariants(productId);
        setVariants(list);

        const withInv: InventoryRow[] = await Promise.all(
          list.map(async (v) => {
            try {
              const inv = await productApi.getInventory(v.id);
              return { ...v, inventory: inv, draftQty: inv.quantity ?? 0 };
            } catch {
              return { ...v, draftQty: 0 };
            }
          }),
        );
        setRows(withInv);
      } catch {
        // Handled gracefully
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId, setVariants]);

  useEffect(() => {
    setTabDirty("inventory", dirtyIds.size > 0);
  }, [dirtyIds, setTabDirty]);

  const updateQty = (variantId: string, val: string) => {
    const parsed = parseInt(val, 10);
    const qty = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setRows((prev) =>
      prev.map((r) => (r.id === variantId ? { ...r, draftQty: qty } : r)),
    );
    setDirtyIds((prev) => new Set(prev).add(variantId));
  };

  const saveInventory = useCallback(async (): Promise<boolean> => {
    try {
      for (const id of Array.from(dirtyIds)) {
        const row = rows.find((r) => r.id === id);
        if (!row || row.draftQty === undefined) continue;
        await productApi.updateInventory(id, {
          quantity: row.draftQty,
          reason: strings.workspace.inventory.reasonDefault,
        });
      }
      setDirtyIds(new Set());
      setTabDirty("inventory", false);
      toast.success(strings.toasts.inventorySaved);
      return true;
    } catch {
      toast.error(strings.toasts.error);
      return false;
    }
  }, [dirtyIds, rows, setTabDirty]);

  useEffect(() => {
    registerSaveHandler("inventory", saveInventory);
  }, [registerSaveHandler, saveInventory]);

  const stats = useMemo(() => {
    const totalOnHand = rows.reduce((acc, r) => acc + (r.draftQty ?? 0), 0);
    const totalReserved = rows.reduce(
      (acc, r) => acc + (r.inventory?.reservedQuantity ?? 0),
      0,
    );
    const totalAvailable = rows.reduce(
      (acc, r) =>
        acc +
        Math.max(0, (r.draftQty ?? 0) - (r.inventory?.reservedQuantity ?? 0)),
      0,
    );
    return { totalOnHand, totalReserved, totalAvailable };
  }, [rows]);

  const columns = useMemo<ColumnDef<InventoryRow>[]>(
    () => [
      {
        accessorKey: "sku",
        header: strings.workspace.inventory.sku,
        cell: ({ row }) => (
          <Inline gap={2} align="center">
            <span className="font-mono text-xs uppercase font-medium">
              {row.original.sku}
            </span>
            {row.original.isDefault && (
              <Badge variant="subtle" size="sm">
                Default
              </Badge>
            )}
          </Inline>
        ),
      },
      {
        id: "quantity",
        header: "On Hand Quantity",
        cell: ({ row }) => (
          <Input
            size="sm"
            type="number"
            min={0}
            value={row.original.draftQty ?? 0}
            onChange={(e) => updateQty(row.original.id, e.target.value)}
            className="w-32"
          />
        ),
      },
      {
        id: "reserved",
        header: strings.workspace.inventory.reserved,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">
            {row.original.inventory?.reservedQuantity ?? 0} units
          </span>
        ),
      },
      {
        id: "available",
        header: strings.workspace.inventory.available,
        cell: ({ row }) => {
          const avail =
            (row.original.draftQty ?? 0) -
            (row.original.inventory?.reservedQuantity ?? 0);
          return (
            <span
              className={`text-xs font-mono font-medium ${
                avail <= 0 ? "text-destructive" : "text-success"
              }`}
            >
              {Math.max(0, avail)} units
            </span>
          );
        },
      },
    ],
    [],
  );

  if (!productId) return null;

  return (
    <Card variant="subtle" className="p-5">
      <Stack gap={5}>
        <div>
          <Text variant="subtitle-1" className="font-semibold text-foreground">
            Inventory & Stock Allocation
          </Text>
          <Text variant="caption" foreground="muted">
            Manage physical stock on hand, allocated reserves, and sellable
            inventory per variant.
          </Text>
        </div>

        {/* Metrics Row */}
        {rows.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card variant="subtle" className="p-3.5 border border-border">
              <Inline gap={2.5} align="center">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Package className="size-4" />
                </div>
                <div>
                  <Text variant="caption" foreground="muted">
                    Total on Hand
                  </Text>
                  <Text variant="body-1" className="font-bold font-mono">
                    {stats.totalOnHand}
                  </Text>
                </div>
              </Inline>
            </Card>

            <Card variant="subtle" className="p-3.5 border border-border">
              <Inline gap={2.5} align="center">
                <div className="p-2 rounded-lg bg-warning/10 text-warning">
                  <ShoppingCart className="size-4" />
                </div>
                <div>
                  <Text variant="caption" foreground="muted">
                    Reserved in Orders
                  </Text>
                  <Text variant="body-1" className="font-bold font-mono">
                    {stats.totalReserved}
                  </Text>
                </div>
              </Inline>
            </Card>

            <Card variant="subtle" className="p-3.5 border border-border">
              <Inline gap={2.5} align="center">
                <div className="p-2 rounded-lg bg-success/10 text-success">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <Text variant="caption" foreground="muted">
                    Available to Sell
                  </Text>
                  <Text variant="body-1" className="font-bold font-mono">
                    {stats.totalAvailable}
                  </Text>
                </div>
              </Inline>
            </Card>
          </div>
        )}

        {rows.length === 0 ? (
          <Card variant="subtle" className="p-8 text-center border-dashed">
            <Text variant="caption" foreground="muted">
              {strings.workspace.inventory.empty}
            </Text>
          </Card>
        ) : (
          <DataTable
            size="sm"
            data={rows}
            columns={columns}
            stickyHeader
            containerClassName="max-h-[min(480px,55vh)] rounded-lg border border-border"
          />
        )}
      </Stack>
    </Card>
  );
};
