"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import {
  Badge,
  Icon,
  Inline,
  MediaCard,
  Price,
  Rating,
  Text,
} from "@timmbr/ui";
import { Heart, Palette, ShoppingBag, Truck } from "@timmbr/icons";
import type { Category } from "@/app/(console)/categories/types";

export interface ProductPreviewData {
  title: string;
  shortDescription: string;
  categoryId: string;
  brandId?: string;
  brandName?: string;
  priceDisplay?: string;
  price?: number;
  compareAtPrice?: number;
  primaryImageUrl?: string | null;
}

export interface ProductPreviewCardProps {
  data: Partial<ProductPreviewData>;
  categories: Category[];
  brandName?: string | null;
  priceDisplay?: string | null;
  primaryImageUrl?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
}

/** Ratio matching storefront Figma node 140:4211 */
const PRODUCT_IMAGE_RATIO = "171/147";

export const ProductPreviewCard: React.FC<ProductPreviewCardProps> = ({
  data,
  categories,
  brandName: explicitBrandName,
  priceDisplay: explicitPriceDisplay,
  primaryImageUrl: explicitPrimaryImage,
  price: explicitPrice,
  compareAtPrice: explicitCompareAt,
}) => {
  const [failedUrl, setFailedUrl] = React.useState<string | null>(null);
  const title = data.title?.trim() || "Untitled Product";
  const category = categories.find((c) => c.id === data.categoryId);
  const brand = explicitBrandName || data.brandName;
  const imageUrl = explicitPrimaryImage ?? data.primaryImageUrl;
  const imgFailed = Boolean(imageUrl && failedUrl === imageUrl);

  // Derive numeric price or fallback display
  const numericPrice = useMemo(() => {
    if (explicitPrice !== undefined && explicitPrice !== null)
      return explicitPrice;
    if (data.price !== undefined && data.price !== null) return data.price;
    const str = explicitPriceDisplay || data.priceDisplay || "";
    const match = str.replace(/,/g, "").match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
  }, [explicitPrice, data.price, explicitPriceDisplay, data.priceDisplay]);

  const numericCompareAt = useMemo(() => {
    if (explicitCompareAt !== undefined && explicitCompareAt !== null)
      return explicitCompareAt;
    if (data.compareAtPrice !== undefined && data.compareAtPrice !== null)
      return data.compareAtPrice;
    return null;
  }, [explicitCompareAt, data.compareAtPrice]);

  const optionsLabel = useMemo(() => {
    if (brand && category) return `${brand} • ${category.name}`;
    if (brand) return brand;
    if (category) return category.name;
    return "Options Available";
  }, [brand, category]);

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* 1:1 Storefront MediaCard */}
      <div className="mx-auto w-full max-w-[280px] rounded-xl border border-border bg-card p-3 shadow-xs">
        <MediaCard
          ratio={PRODUCT_IMAGE_RATIO}
          mediaZoom
          titleSize="sm"
          spacing="relaxed"
          media={
            imageUrl && !imgFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={title}
                className="size-full object-cover"
                onError={() => setFailedUrl(imageUrl)}
              />
            ) : null
          }
          mediaFallback={
            <Icon size="xl">
              <ShoppingBag className="size-8 text-muted-foreground/40" />
            </Icon>
          }
          mediaTopStart={
            <Badge variant="primary" size="sm">
              New
            </Badge>
          }
          mediaTopEnd={
            <button
              type="button"
              aria-label="Wishlist"
              className="flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground drop-shadow-xs transition-transform hover:scale-110"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="size-4 text-muted-foreground" />
            </button>
          }
          eyebrow={
            <Inline gap={1} align="center" wrap={false}>
              <Icon size="sm" foreground="primary">
                <Palette className="size-3.5" />
              </Icon>
              <Text as="span" variant="body-3" foreground="muted" truncate>
                {optionsLabel}
              </Text>
            </Inline>
          }
          titleAs="h3"
          title={title}
          meta={
            <Inline gap={2} justify="between" align="center" wrap={false}>
              <Rating value={5.0} count={1} />
              <Inline gap={1} align="center" wrap={false}>
                <Icon size="sm" foreground="primary">
                  <Truck className="size-3.5" />
                </Icon>
                <Text as="span" variant="caption">
                  Ships in 2 Days
                </Text>
              </Inline>
            </Inline>
          }
          aside={
            numericPrice !== null && numericPrice > 0 ? (
              <Price
                amount={numericPrice}
                compareAt={numericCompareAt}
                currency="INR"
              />
            ) : (
              <span className="text-body-2 font-medium text-muted-foreground">
                Price TBD
              </span>
            )
          }
        />
      </div>
    </div>
  );
};
