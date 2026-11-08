"use client";

import React from "react";
import {
  Badge,
  Stack,
  Text,
  type ColumnDef,
  type CellContext,
} from "@timmbr/ui";
import { formatMoney, formatDateTime } from "./lib/formatMoney";
import { strings } from "./strings";
import { OrderStatusBadge } from "./components/OrderStatusBadge";
import type { AdminOrder, PaymentStatus } from "./types";

function formatPlacedAt(order: AdminOrder): string {
  return formatDateTime(order.placedAt ?? order.createdAt);
}

function formatMoneyColumn(amount: number | string, currency: string): string {
  return formatMoney(amount, currency);
}

function paymentStatusLabel(status: PaymentStatus | null): string {
  if (!status) return strings.paymentStatus.none;
  return strings.paymentStatus[status] ?? status;
}

function paymentVariant(
  status: PaymentStatus | null,
): "success" | "destructive" | "subtle" | "outline" {
  if (!status) return "outline";
  switch (status) {
    case "PAID":
      return "success";
    case "FAILED":
    case "CANCELLED":
      return "destructive";
    case "PENDING":
    case "PROCESSING":
      return "subtle";
    default:
      return "outline";
  }
}

export function createOrderColumns(): ColumnDef<AdminOrder>[] {
  return [
    {
      accessorKey: "orderNumber",
      enableSorting: false,
      header: strings.table.orderNumber,
      cell: ({ row }: CellContext<AdminOrder, unknown>) => (
        <span className="font-mono text-sm font-semibold text-foreground">
          {row.original.orderNumber}
        </span>
      ),
    },
    {
      id: "customer",
      enableSorting: false,
      header: strings.table.customer,
      cell: ({ row }: CellContext<AdminOrder, unknown>) => {
        const { customer } = row.original;
        return (
          <Stack gap={0.5} className="py-0.5 min-w-[180px]">
            <Text variant="body-2" className="font-semibold truncate">
              {customer.name}
            </Text>
            <Text variant="body-3" foreground="muted" className="truncate">
              {customer.email}
            </Text>
          </Stack>
        );
      },
    },
    {
      accessorKey: "status",
      enableSorting: false,
      header: strings.table.status,
      cell: ({ row }: CellContext<AdminOrder, unknown>) => (
        <OrderStatusBadge status={row.original.status} />
      ),
    },
    {
      id: "payment",
      enableSorting: false,
      header: strings.table.payment,
      cell: ({ row }: CellContext<AdminOrder, unknown>) => {
        const { paymentStatus, paymentMethod } = row.original;
        const providerLabel = paymentMethod
          ? (strings.paymentProvider[paymentMethod] ?? paymentMethod)
          : null;
        return (
          <Stack gap={1}>
            <Badge variant={paymentVariant(paymentStatus)} size="sm">
              {paymentStatusLabel(paymentStatus)}
            </Badge>
            {providerLabel ? (
              <Text variant="body-3" foreground="subtle">
                {providerLabel}
              </Text>
            ) : null}
          </Stack>
        );
      },
    },
    {
      accessorKey: "itemsCount",
      enableSorting: false,
      header: strings.table.items,
      cell: ({ row }: CellContext<AdminOrder, unknown>) => (
        <span className="text-sm tabular-nums">{row.original.itemsCount}</span>
      ),
    },
    {
      id: "total",
      enableSorting: false,
      header: strings.table.total,
      cell: ({ row }: CellContext<AdminOrder, unknown>) => (
        <span className="text-sm font-semibold tabular-nums">
          {formatMoneyColumn(row.original.grandTotal, row.original.currency)}
        </span>
      ),
    },
    {
      id: "placedAt",
      enableSorting: false,
      header: strings.table.placedAt,
      cell: ({ row }: CellContext<AdminOrder, unknown>) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatPlacedAt(row.original)}
        </span>
      ),
    },
  ];
}
