import React from "react";
import { Grid, Stack, Text, Card, EmptyState, Alert } from "@timmbr/ui";
import { Tags } from "lucide-react";
import { PageHeader } from "@/components";
import { categoryApi } from "./api";
import { CategoryCard, NewCategoryButton } from "./components";
import type { Category } from "./types";
import { strings } from "./strings";

export const metadata = {
  title: strings.metadata.title,
  description: strings.metadata.description,
};

export default async function CategoriesPage() {
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    const res = await categoryApi.getCategories();
    categories = res.data;
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : strings.error.description;
  }

  return (
    <Stack gap={6}>
      {/* ── Page Header with Top-Right Action ── */}
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
          className="py-12 border border-dashed border-grey-300 rounded-2xl"
        >
          <EmptyState
            icon={<Tags className="size-8 text-primary" />}
            title={strings.empty.title}
            description={strings.empty.description}
            action={
              <NewCategoryButton
                categories={categories}
                label={strings.empty.action}
              />
            }
          />
        </Card>
      )}

      {/* ── Server-Rendered Categories Grid ── */}
      {!error && categories.length > 0 && (
        <Grid cols={{ sm: 1, md: 1, lg: 2, xl: 3 }} gap={5}>
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </Grid>
      )}
    </Stack>
  );
}
