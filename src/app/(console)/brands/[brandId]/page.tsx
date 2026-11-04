import React from "react";
import { notFound } from "next/navigation";
import { Alert } from "@timmbr/ui";
import { brandApi } from "../api";
import { strings } from "../strings";
import { BrandDetailView } from "./components/BrandDetailView";

interface BrandDetailPageProps {
  params: Promise<{ brandId: string }>;
}

export async function generateMetadata({ params }: BrandDetailPageProps) {
  const { brandId } = await params;
  try {
    const brand = await brandApi.getBrandById(brandId);
    return { title: strings.metadata.detailTitle(brand.name) };
  } catch {
    return { title: strings.metadata.title };
  }
}

export default async function BrandDetailPage({
  params,
}: BrandDetailPageProps) {
  const { brandId } = await params;

  let brand = null;
  let error: string | null = null;

  try {
    brand = await brandApi.getBrandById(brandId);
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : "Failed to load brand.";
  }

  if (error) {
    return (
      <Alert variant="destructive" title={strings.error.title}>
        {error}
      </Alert>
    );
  }

  if (!brand) {
    notFound();
  }

  return <BrandDetailView initialBrand={brand} />;
}
