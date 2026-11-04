"use server";

import { revalidateByTag, revalidateByPath } from "@/lib/cache";

export async function revalidateProducts() {
  await Promise.all([
    revalidateByTag("products"),
    revalidateByTag("product-stats"),
  ]);
}

export async function revalidateProduct(productId?: string) {
  await revalidateByTag("products");
  await revalidateByTag("product-stats");
  if (productId) {
    await revalidateByTag(`product-${productId}`);
    await revalidateByPath(`/products/${productId}`);
  }
}
