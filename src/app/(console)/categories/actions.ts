"use server";

import { revalidatePath } from "next/cache";

/**
 * Revalidates the categories list page route and data cache.
 */
export async function revalidateCategories() {
  revalidatePath("/categories");
}

/**
 * Revalidates both the list page and specific category detail page.
 */
export async function revalidateCategory(catId?: string) {
  revalidatePath("/categories");
  if (catId) {
    revalidatePath(`/categories/${catId}`);
  }
}
