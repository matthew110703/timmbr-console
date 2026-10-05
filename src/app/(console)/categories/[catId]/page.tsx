import React from "react";
import { notFound } from "next/navigation";
import { Stack, Alert, Text } from "@timmbr/ui";
import { categoryApi } from "../api";
import { CategoryDetailView } from "./components/CategoryDetailView";
import { strings } from "../strings";
import type { Category, CategoryWithParent } from "../types";

export interface CategoryDetailPageProps {
  params: Promise<{
    catId: string;
  }>;
}

export async function generateMetadata({ params }: CategoryDetailPageProps) {
  const { catId } = await params;
  try {
    const category = await categoryApi.getCategoryById(catId);
    return {
      title: strings.metadata.detailTitle(category.name),
      description: category.description || strings.metadata.description,
    };
  } catch {
    return {
      title: "Category Details | Timmbr Console",
      description: strings.metadata.description,
    };
  }
}

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { catId } = await params;

  let category: CategoryWithParent | null = null;
  let allCategories: Category[] = [];
  let error: string | null = null;

  try {
    const [catRes, allCatsRes] = await Promise.all([
      categoryApi.getCategoryById(catId),
      categoryApi.getCategories({ limit: 100 }),
    ]);

    category = catRes;
    allCategories = allCatsRes.data;
  } catch (err: unknown) {
    // If not found, show 404 or error banner
    error =
      err instanceof Error ? err.message : "Failed to load category details.";
  }

  if (!category && !error) {
    notFound();
  }

  if (error || !category) {
    return (
      <Stack gap={6}>
        <Alert variant="destructive" title="Category Not Found">
          <Text variant="caption" className="text-destructive-foreground mt-1">
            {error || "The requested category could not be found."}
          </Text>
        </Alert>
      </Stack>
    );
  }

  return (
    <CategoryDetailView
      initialCategory={category}
      allCategories={allCategories}
    />
  );
}
