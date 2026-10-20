import React from "react";
import { safeApiCall } from "@timmbr/utils";
import { attributeApi } from "./api";
import { AttributeListView } from "./components";
import { strings } from "./strings";

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

interface AttributesPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AttributesPage({
  searchParams,
}: AttributesPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const res = await safeApiCall(
    () =>
      attributeApi.getAttributeDefinitions({
        page,
        limit: PAGE_LIMIT,
        search: params.search,
      }),
    { data: [], meta: DEFAULT_META },
    "[AttributesPage]",
  );

  return <AttributeListView initialData={res.data} meta={res.meta} />;
}
