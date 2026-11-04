import React from "react";
import { categoryApi } from "../../categories/api";
import { brandApi } from "../../brands/api";
import { ProductCreateWizard } from "./components/ProductCreateWizard";

export const metadata = {
  title: "Create Product — Timmbr Console",
  description: "Add a new product to your catalogue step by step.",
};

export default async function NewProductPage() {
  const [categoriesRes, brandsRes] = await Promise.all([
    categoryApi.getCategories({ limit: 100, status: "ACTIVE" }),
    brandApi.getBrands({ limit: 100 }),
  ]);

  return (
    <ProductCreateWizard
      categories={categoriesRes.data}
      brands={brandsRes.data}
    />
  );
}
