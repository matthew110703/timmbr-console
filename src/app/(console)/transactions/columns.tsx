"use client";

import React from "react";
import { Stack, Text, type ColumnDef, type CellContext } from "@timmbr/ui";
import { OrderStatusBadge } from "@/app/(console)/orders/components/OrderStatusBadge";
import { formatDateTime, formatMoney } from "./lib/formatMoney";
import { strings } from "./strings";
import { PaymentStatusBadge } from "./components/PaymentStatusBadge";
import type { TransactionListItem } from "./types";

function providerLabel(provider: TransactionListItem["provider"]): string {
  return strings.paymentProvider[provider] ?? provider;
}

export function createTransactionColumns(): ColumnDef<TransactionListItem>[] {
  return [
    {
      accessorKey: "orderNumber",
      enableSorting: false,
      header: strings.table.orderNumber,
      cell: ({ row }: CellContext<TransactionListItem, unknown>) => (
        <span className="font-mono text-sm font-semibold text-foreground">
          {row.original.orderNumber}
        </span>
      ),
    },
    {
      id: "customer",
      enableSorting: false,
      header: strings.table.customer,
      cell: ({ row }: CellContext<TransactionListItem, unknown>) => {
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
      id: "paymentStatus",
      enableSorting: false,
      header: strings.table.paymentStatus,
      cell: ({ row }: CellContext<TransactionListItem, unknown>) => (
        <PaymentStatusBadge status={row.original.status} />
      ),
    },
    {
      id: "orderStatus",
      enableSorting: false,
      header: strings.table.orderStatus,
      cell: ({ row }: CellContext<TransactionListItem, unknown>) => (
        <OrderStatusBadge status={row.original.orderStatus} />
      ),
    },
    {
      accessorKey: "provider",
      enableSorting: false,
      header: strings.table.provider,
      cell: ({ row }: CellContext<TransactionListItem, unknown>) => (
        <Text variant="body-2">{providerLabel(row.original.provider)}</Text>
      ),
    },
    {
      id: "amount",
      enableSorting: false,
      header: strings.table.amount,
      cell: ({ row }: CellContext<TransactionListItem, unknown>) => (
        <span className="text-sm font-semibold tabular-nums">
          {formatMoney(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      id: "providerPaymentId",
      enableSorting: false,
      header: strings.table.providerPaymentId,
      cell: ({ row }: CellContext<TransactionListItem, unknown>) => (
        <span className="font-mono text-xs text-muted-foreground truncate max-w-[140px] block">
          {row.original.providerPaymentId ?? "—"}
        </span>
      ),
    },
    {
      id: "createdAt",
      enableSorting: false,
      header: strings.table.createdAt,
      cell: ({ row }: CellContext<TransactionListItem, unknown>) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
    },
  ];
}
