import React from "react";
import { Grid, Stack, Text, Card, EmptyState, Alert } from "@timmbr/ui";
import { Tags } from "lucide-react";
import { PageHeader } from "@/components";
import { categoryApi } from "./api";
import {
  CategoryCard,
  NewCategoryButton,
  CategoryPagination,
  CategoryStatusTabs,
} from "./components";
import type { Category, CategoryStatus } from "./types";
import { strings } from "./strings";

export const metadata = {
  title: strings.metadata.title,
  description: strings.metadata.description,
};

const PAGE_LIMIT = 20;

interface CategoriesPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const params = await searchParams;
  const rawStatus = params.status?.toUpperCase();
  const activeStatus =
    rawStatus && ["ACTIVE", "INACTIVE", "ARCHIVED"].includes(rawStatus)
      ? (rawStatus as CategoryStatus)
      : undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  let categories: Category[] = [];
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
    const res = await categoryApi.getCategories({
      status: activeStatus,
      page,
      limit: PAGE_LIMIT,
    });
    categories = res.data;
    meta = res.meta;
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : strings.error.description;
  }

  return (
    <Stack gap={6}>
      <PageHeader
        title={strings.header.title}
        description={strings.header.subtitle}
        action={
          <NewCategoryButton
            categories={categories}
            label={strings.header.newCategory}
          />
        }
      />

      {/* ── Status Filter Tabs ── */}
      <CategoryStatusTabs activeStatus={activeStatus} />

      {/* ── Error State ── */}
      {error && (
        <Alert variant="destructive" title={strings.error.title}>
          <Text variant="caption" className="text-destructive-foreground mt-1">
            {error}
          </Text>
        </Alert>
      )}

      {/* ── Empty State ── */}
      {!error && categories.length === 0 && (
        <Card
          variant="subtle"
          className="py-12 border border-dashed border-border rounded-2xl"
        >
          <EmptyState
            fullWidth
            icon={<Tags className="size-8 text-primary" />}
            title={strings.empty.title}
            description={
              activeStatus
                ? strings.empty.filteredDescription
                : strings.empty.description
            }
            action={
              !activeStatus ? (
                <NewCategoryButton
                  categories={categories}
                  label={strings.empty.action}
                />
              ) : undefined
            }
          />
        </Card>
      )}

      {/* ── Categories Grid ── */}
      {!error && categories.length > 0 && (
        <Stack gap={5}>
          <Grid cols={{ sm: 1, md: 1, lg: 2, xl: 3 }} gap={5}>
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </Grid>
          <CategoryPagination meta={meta} />
        </Stack>
      )}
    </Stack>
  );
}
