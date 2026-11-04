"use client";

import React, { useMemo } from "react";
import { Stack, Text, Inline, Badge, Card } from "@timmbr/ui";
import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import { strings } from "../strings";
import type { Product, ProductImage, ProductVariant } from "../types";

export interface ListingReadinessPanelProps {
  product: Product | null;
  variants: ProductVariant[];
  images: ProductImage[];
  compact?: boolean;
}

export const ListingReadinessPanel: React.FC<ListingReadinessPanelProps> = ({
  product,
  variants,
  images,
}) => {
  const priceRange = useMemo(() => {
    if (variants.length === 0) return "TBD";
    const prices = variants.map((v) => v.price).filter((p) => p !== undefined);
    if (prices.length === 0) return "TBD";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max
      ? `₹${min.toLocaleString("en-IN")}`
      : `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}`;
  }, [variants]);

  const checklist = useMemo(() => {
    const hasTitle = Boolean(product?.title);
    const hasCategory = Boolean(product?.categoryId);
    const hasTax = product?.gstRate !== undefined && product?.gstRate !== null;
    const hasVariants = variants.length > 0;
    const hasDefault = variants.some((v) => v.isDefault);
    const hasMedia = images.length > 0 || Boolean(product?.coverImage);
    const hasPrimary =
      images.some((img) => img.isPrimary) || Boolean(product?.coverImage);
    const totalStock = variants.reduce(
      (acc, v) => acc + (v.availability?.quantity ?? 0),
      0,
    );
    const hasStock = totalStock > 0;

    return [
      {
        id: "info",
        label: "Basic Details",
        description:
          hasTitle && hasCategory
            ? `${product?.title}${
                product?.category?.name ? ` in ${product.category.name}` : ""
              }`
            : "Product title and category required",
        passed: hasTitle && hasCategory && hasTax,
        optional: false,
      },
      {
        id: "variants",
        label: "Variants & Pricing",
        description: hasVariants
          ? `${variants.length} variant(s) • ${priceRange}${
              hasDefault ? " • Default set" : ""
            }`
          : "At least one variant required",
        passed: hasVariants,
        optional: false,
      },
      {
        id: "media",
        label: "Media Assets",
        description: hasMedia
          ? `${images.length} image(s)${hasPrimary ? " • Primary set" : ""}`
          : "No images uploaded yet",
        passed: hasMedia,
        optional: true,
      },
      {
        id: "stock",
        label: "Inventory Stock",
        description: hasStock
          ? `${totalStock} unit(s) on hand`
          : "0 units in stock",
        passed: hasStock,
        optional: true,
      },
    ];
  }, [product, variants, images, priceRange]);

  const requiredPassed = checklist
    .filter((item) => !item.optional)
    .every((item) => item.passed);

  const passedCount = checklist.filter((item) => item.passed).length;

  const isPublished = product?.status === "ACTIVE";
  const isArchived = product?.status === "ARCHIVED";

  const panelTitle = isPublished
    ? "Listing Health"
    : isArchived
      ? "Listing Status"
      : "Pre-flight Checklist";

  const badgeText = isPublished
    ? requiredPassed
      ? "Live on storefront"
      : "Needs attention"
    : isArchived
      ? "Archived"
      : requiredPassed
        ? "Ready to publish"
        : `${passedCount}/${checklist.length} ready`;

  const badgeVariant = isPublished
    ? requiredPassed
      ? "success"
      : "warning"
    : isArchived
      ? "default"
      : requiredPassed
        ? "success"
        : "warning";

  return (
    <Stack gap={3}>
      <Inline justify="between" align="center">
        <Text
          variant="caption"
          className="font-semibold text-foreground uppercase tracking-wider"
        >
          {panelTitle}
        </Text>
        <Badge variant={badgeVariant} size="sm">
          {badgeText}
        </Badge>
      </Inline>

      <Stack gap={2}>
        {checklist.map((item) => {
          let Icon = CheckCircle2;
          let iconColor = "text-success";

          if (!item.passed) {
            if (item.optional) {
              Icon = AlertTriangle;
              iconColor = "text-warning";
            } else {
              Icon = AlertCircle;
              iconColor = "text-destructive";
            }
          }

          return (
            <div
              key={item.id}
              className={[
                "rounded-md border p-2.5 transition-colors",
                item.passed
                  ? "bg-card/50 border-border"
                  : item.optional
                    ? "bg-warning/5 border-warning/20"
                    : "bg-destructive/5 border-destructive/20",
              ].join(" ")}
            >
              <Inline gap={2} align="start">
                <Icon className={`size-4 shrink-0 mt-0.5 ${iconColor}`} />
                <div className="min-w-0 flex-1">
                  <Text
                    variant="caption"
                    className="font-medium text-foreground block truncate"
                  >
                    {item.label}
                  </Text>
                  <Text
                    variant="caption"
                    foreground="muted"
                    className="text-[11px] leading-tight block line-clamp-2"
                  >
                    {item.description}
                  </Text>
                </div>
              </Inline>
            </div>
          );
        })}
      </Stack>
    </Stack>
  );
};
