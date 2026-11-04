import React from "react";
import { safeApiCall } from "@timmbr/utils";
import { productApi } from "./api";
import { ProductListView } from "./components";
import { strings } from "./strings";
import type { ProductStatus } from "./types";

export const metadata = {
  title: strings.metadata.title,
  description: strings.metadata.description,
};

const PAGE_LIMIT = 10;

const DEFAULT_META = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const DEFAULT_STATS = { total: 0, active: 0, draft: 0, archived: 0 };

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const rawStatus = params.status?.toUpperCase();
  const status =
    rawStatus && ["ACTIVE", "DRAFT", "ARCHIVED"].includes(rawStatus)
      ? (rawStatus as ProductStatus)
      : undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [res, stats] = await Promise.all([
    safeApiCall(
      () =>
        productApi.getProducts({
          page,
          limit: PAGE_LIMIT,
          status,
          search: params.search,
        }),
      { data: [], meta: DEFAULT_META },
      "[ProductsPage]",
    ),
    safeApiCall(() => productApi.getStats(), DEFAULT_STATS, "[ProductsPage]"),
  ]);

  return <ProductListView products={res.data} stats={stats} meta={res.meta} />;
}
