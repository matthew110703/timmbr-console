import React from "react";
import { safeApiCall } from "@timmbr/utils";
import { orderApi } from "./api";
import { OrderListView } from "./components";
import {
  SORT_PRESET_PARAMS,
  type OrderListSortPreset,
} from "./lib/orderTransitions";
import { strings } from "./strings";
import type { OrderStatus } from "./types";

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

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

function parseSortPreset(raw: string | undefined): OrderListSortPreset {
  if (
    raw === "oldest" ||
    raw === "highestTotal" ||
    raw === "lowestTotal" ||
    raw === "newest"
  ) {
    return raw;
  }
  return "newest";
}

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    sort?: string;
    sortBy?: string;
    order?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const sortPreset = parseSortPreset(params.sort);
  const presetSort = SORT_PRESET_PARAMS[sortPreset];
  const sortBy =
    params.sortBy === "placedAt" ||
    params.sortBy === "grandTotal" ||
    params.sortBy === "createdAt"
      ? params.sortBy
      : presetSort.sortBy;
  const order =
    params.order === "asc" || params.order === "desc"
      ? params.order
      : presetSort.order;

  const rawStatus = params.status?.toUpperCase();
  const status =
    rawStatus && ORDER_STATUSES.includes(rawStatus as OrderStatus)
      ? [rawStatus as OrderStatus]
      : undefined;

  const res = await safeApiCall(
    () =>
      orderApi.getOrders({
        page,
        limit: PAGE_LIMIT,
        search: params.search,
        status,
        sortBy,
        order,
      }),
    { data: [], meta: DEFAULT_META },
    "[OrdersPage]",
  );

  return <OrderListView initialData={res.data} meta={res.meta} />;
}
