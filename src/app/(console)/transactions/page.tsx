import React from "react";
import { safeApiCall } from "@timmbr/utils";
import { transactionApi } from "./api";
import { TransactionListView } from "./components";
import { strings } from "./strings";
import type { PaymentStatus } from "./types";

export const metadata = {
  title: strings.metadata.title,
  description: strings.metadata.description,
};

const PAGE_LIMIT = 20;

const DEFAULT_META = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
];

interface TransactionsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const rawStatus = params.status?.toUpperCase();
  const status =
    rawStatus && PAYMENT_STATUSES.includes(rawStatus as PaymentStatus)
      ? [rawStatus as PaymentStatus]
      : undefined;

  const res = await safeApiCall(
    () =>
      transactionApi.getTransactions({
        page,
        limit: PAGE_LIMIT,
        search: params.search,
        status,
      }),
    { data: [], meta: DEFAULT_META },
    "[TransactionsPage]",
  );

  return <TransactionListView initialData={res.data} meta={res.meta} />;
}
