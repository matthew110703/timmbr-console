import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { categoryApi } from "../../categories/api";
import { brandApi } from "../../brands/api";
import { productApi } from "../api";
import { ProductWorkspace } from "../components/ProductWorkspace";
import { strings } from "../strings";
import type { Category } from "../../categories/types";
import type { Brand } from "../../brands/types";
import type { Product, ProductVariant, ProductImage } from "../types";

export interface ProductEditPageProps {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: ProductEditPageProps) {
  const { productId } = await params;
  try {
    const product = await productApi.getProduct(productId);
    return {
      title: `${product.title} — Timmbr Console`,
      description: strings.metadata.description,
    };
  } catch {
    return { title: strings.metadata.title };
  }
}

export default async function ProductEditPage({
  params,
}: ProductEditPageProps) {
  const { productId } = await params;

  let product: Product;
  let categories: Category[] = [];
  let brands: Brand[] = [];
  let variants: ProductVariant[] = [];
  let images: ProductImage[] = [];

  try {
    const [productRes, categoriesRes, brandsRes, variantsRes, imagesRes] =
      await Promise.allSettled([
        productApi.getProduct(productId),
        categoryApi.getCategories({ limit: 100, status: "ACTIVE" }),
        brandApi.getBrands({ limit: 100 }),
        productApi.getVariants(productId),
        productApi.getProductImages(productId),
      ]);

    if (productRes.status === "rejected") {
      notFound();
    }

    product = productRes.value;
    if (categoriesRes.status === "fulfilled") {
      categories = categoriesRes.value.data;
    }
    if (brandsRes.status === "fulfilled") {
      brands = brandsRes.value.data;
    }

    if (
      variantsRes.status === "fulfilled" &&
      Array.isArray(variantsRes.value)
    ) {
      variants = variantsRes.value;
    } else if (Array.isArray(product.variants)) {
      variants = product.variants;
    }

    if (imagesRes.status === "fulfilled" && Array.isArray(imagesRes.value)) {
      images = imagesRes.value;
    }
  } catch {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <ProductWorkspace
        isCreateMode={false}
        initialProduct={product}
        categories={categories}
        brands={brands}
        initialVariants={variants}
        initialImages={images}
      />
    </Suspense>
  );
}
