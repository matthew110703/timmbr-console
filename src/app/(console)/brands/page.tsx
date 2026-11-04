import React from "react";
import { Grid, Stack, Text, Card, EmptyState, Alert } from "@timmbr/ui";
import { Tag } from "lucide-react";
import { PageHeader } from "@/components";
import { brandApi } from "./api";
import {
  BrandCard,
  NewBrandButton,
  BrandPagination,
  BrandStatusTabs,
  BrandSearchToolbar,
} from "./components";
import type { Brand, BrandStatus } from "./types";
import { strings } from "./strings";

export const metadata = {
  title: strings.metadata.title,
  description: strings.metadata.description,
};

const PAGE_LIMIT = 20;

interface BrandsPageProps {
  searchParams: Promise<{ status?: string; page?: string; search?: string }>;
}

export default async function BrandsPage({ searchParams }: BrandsPageProps) {
  const params = await searchParams;
  const rawStatus = params.status?.toUpperCase();
  const activeStatus =
    rawStatus && ["ACTIVE", "INACTIVE", "ARCHIVED"].includes(rawStatus)
      ? (rawStatus as BrandStatus)
      : undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = params.search?.trim() || undefined;

  let brands: Brand[] = [];
  let meta = {
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
  let error: string | null = null;

  try {
    const res = await brandApi.getBrands({
      status: activeStatus,
      search,
      page,
      limit: PAGE_LIMIT,
    });
    brands = res.data;
    meta = res.meta;
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : strings.error.description;
  }

  const isFiltered = Boolean(activeStatus || search);

  return (
    <Stack gap={6}>
      <PageHeader
        title={strings.header.title}
        description={strings.header.subtitle}
        action={<NewBrandButton label={strings.header.newBrand} />}
      />

      {/* ── Status Filter Tabs & Search Toolbar ── */}
      <Stack gap={3}>
        <BrandStatusTabs activeStatus={activeStatus} />
        <BrandSearchToolbar key={search ?? "empty"} initialSearch={search} />
      </Stack>

      {/* ── Error State ── */}
      {error && (
        <Alert variant="destructive" title={strings.error.title}>
          <Text variant="caption" className="text-destructive-foreground mt-1">
            {error}
          </Text>
        </Alert>
      )}

      {/* ── Empty State ── */}
      {!error && brands.length === 0 && (
        <Card
          variant="subtle"
          className="py-12 border border-dashed border-border rounded-2xl"
        >
          <EmptyState
            fullWidth
            icon={<Tag className="size-8 text-primary" />}
            title={strings.empty.title}
            description={
              isFiltered
                ? strings.empty.filteredDescription
                : strings.empty.description
            }
            action={
              !isFiltered ? (
                <NewBrandButton label={strings.empty.action} />
              ) : undefined
            }
          />
        </Card>
      )}

      {/* ── Brands Grid ── */}
      {!error && brands.length > 0 && (
        <Stack gap={5}>
          <Grid cols={{ sm: 1, md: 1, lg: 2, xl: 3 }} gap={5}>
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </Grid>
          <BrandPagination meta={meta} />
        </Stack>
      )}
    </Stack>
  );
}
