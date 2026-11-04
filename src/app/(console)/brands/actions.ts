"use server";

import { revalidateByTag, revalidateByPath } from "@/lib/cache";

export async function revalidateBrands() {
  await Promise.all([revalidateByTag("brands"), revalidateByPath("/brands")]);
}

export async function revalidateBrand(brandId?: string) {
  await Promise.all([revalidateByTag("brands"), revalidateByPath("/brands")]);
  if (brandId) {
    await Promise.all([
      revalidateByTag(`brand-${brandId}`),
      revalidateByPath(`/brands/${brandId}`),
    ]);
  }
}
