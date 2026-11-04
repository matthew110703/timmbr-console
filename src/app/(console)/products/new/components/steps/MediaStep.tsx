"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Stack,
  Inline,
  Text,
  Badge,
  Alert,
  toast,
  ImageUpload,
  type ImageUploadItem,
} from "@timmbr/ui";
import { Star, Layers } from "lucide-react";
import { productApi } from "../../../api";
import { strings } from "../../../strings";
import type { ProductImage, ProductVariant } from "../../../types";

export interface MediaStepProps {
  productId: string;
  onSuccess?: () => void;
  onBack?: () => void;
  onPrimaryImageChange?: (imageUrl: string | null) => void;
}

export const MediaStep: React.FC<MediaStepProps> = ({
  productId,
  onSuccess,
  onPrimaryImageChange,
}) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeVariantId = useMemo(() => {
    if (variants.length === 0) return null;
    if (selectedVariantId && variants.some((v) => v.id === selectedVariantId)) {
      return selectedVariantId;
    }
    const defaultVar = variants.find((v) => v.isDefault) || variants[0];
    return defaultVar?.id || null;
  }, [variants, selectedVariantId]);

  const loadData = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const [imgsRes, varsRes] = await Promise.allSettled([
        productApi.getProductImages(productId),
        productApi.getVariants(productId),
      ]);

      if (imgsRes.status === "fulfilled") {
        const imgList = imgsRes.value;
        setImages(imgList);
        const primary = imgList.find((img) => img.isPrimary) || imgList[0];
        onPrimaryImageChange?.(primary ? primary.url : null);
      }

      if (varsRes.status === "fulfilled" && Array.isArray(varsRes.value)) {
        setVariants(varsRes.value);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : strings.toasts.error);
    } finally {
      setLoading(false);
    }
  }, [productId, onPrimaryImageChange]);

  useEffect(() => {
    if (!productId) return;
    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) {
        loadData();
      }
    });
    return () => {
      ignore = true;
    };
  }, [loadData, productId]);

  const handleUpload = async (file: File, targetVariantId?: string | null) => {
    if (!productId) throw new Error("Missing product ID");

    // 1. Generate presigned upload URL
    const presign = await productApi.presignProductImages(productId, [
      {
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      },
    ]);

    const entry = presign.files[0];
    if (!entry) throw new Error("Failed to get presigned upload URL");

    // 2. Upload file to R2 / S3 storage
    const uploadRes = await fetch(entry.uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!uploadRes.ok) {
      throw new Error(`Failed to upload ${file.name} to storage.`);
    }

    const storageKey = entry.key || entry.storageKey;
    if (!storageKey) {
      throw new Error(`Missing storage key for ${file.name}`);
    }

    // 3. Register image in database
    const isProductLevel = !targetVariantId;
    const existingCount = isProductLevel
      ? images.filter((i) => !i.variantId).length
      : images.filter((i) => i.variantId === targetVariantId).length;

    const regRes = await productApi.registerProductImages(productId, [
      {
        storageKey,
        variantId: targetVariantId || undefined,
        sortOrder: existingCount,
        isPrimary: isProductLevel && existingCount === 0,
        altText: file.name.slice(0, 200),
      },
    ]);

    const registered = Array.isArray(regRes?.images) ? regRes.images : [];
    if (registered.length > 0) {
      setImages((prev) => {
        const next = [...prev, ...registered];
        const primary = next.find((img) => img.isPrimary) || next[0];
        onPrimaryImageChange?.(primary ? primary.url : null);
        return next;
      });
    }

    toast.success("Image uploaded successfully");
    await loadData();

    return {
      url: registered[0]?.url || entry.publicUrl || storageKey,
      key: storageKey,
      name: file.name,
    };
  };

  const handleRemove = async (
    _index?: number,
    item?: ImageUploadItem | string,
  ) => {
    const targetId = typeof item === "object" ? item.id : undefined;
    if (!targetId || !productId) return;

    try {
      await productApi.deleteProductImages(productId, [targetId]);
      const fresh = await productApi.getProductImages(productId);
      setImages(fresh);
      const primary = fresh.find((img) => img.isPrimary) || fresh[0];
      onPrimaryImageChange?.(primary ? primary.url : null);
      toast.success("Image removed");
    } catch {
      toast.error(strings.toasts.error);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      await productApi.setPrimaryProductImage(productId, imageId);
      const fresh = await productApi.getProductImages(productId);
      setImages(fresh);
      const primary = fresh.find((img) => img.id === imageId);
      onPrimaryImageChange?.(primary ? primary.url : null);
      toast.success("Primary image updated");
    } catch {
      toast.error(strings.toasts.error);
    }
  };

  const productImages = useMemo(
    () => images.filter((img) => !img.variantId),
    [images],
  );

  const activeVariant = useMemo(
    () => variants.find((v) => v.id === activeVariantId),
    [variants, activeVariantId],
  );

  const activeVariantImages = useMemo(
    () => images.filter((img) => img.variantId === activeVariantId),
    [images, activeVariantId],
  );

  const totalVariantImages = useMemo(
    () => images.filter((img) => Boolean(img.variantId)).length,
    [images],
  );

  const productUploadValue: ImageUploadItem[] = useMemo(() => {
    return productImages.map((img) => ({
      id: img.id,
      url: img.url,
      key: img.storageKey,
      name: img.altText || img.storageKey.split("/").pop(),
      type: "image",
    }));
  }, [productImages]);

  const variantUploadValue: ImageUploadItem[] = useMemo(() => {
    return activeVariantImages.map((img) => ({
      id: img.id,
      url: img.url,
      key: img.storageKey,
      name: img.altText || img.storageKey.split("/").pop(),
      type: "image",
    }));
  }, [activeVariantImages]);

  const handleSubmitStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSuccess?.();
  };

  return (
    <form id="media-step-form" onSubmit={handleSubmitStep}>
      <Stack gap={6}>
        {error && <Alert variant="destructive">{error}</Alert>}

        {/* Section 1: Global Product Media */}
        <Card variant="subtle" className="p-5">
          <Stack gap={4}>
            <Inline justify="between" align="start" className="flex-wrap gap-2">
              <div>
                <Inline gap={2} align="center">
                  <Text
                    variant="subtitle-1"
                    className="font-semibold text-foreground"
                  >
                    Product Media (Global)
                  </Text>
                  <Badge variant="subtle" size="sm">
                    {productImages.length} photo
                    {productImages.length === 1 ? "" : "s"}
                  </Badge>
                </Inline>
                <Text variant="caption" foreground="muted">
                  General photos shown on storefront listing cards, search
                  results, and main gallery.
                </Text>
              </div>
            </Inline>

            {loading && images.length === 0 ? (
              <Card variant="subtle" className="p-8 text-center border-dashed">
                <Text variant="caption" foreground="muted">
                  Loading product media...
                </Text>
              </Card>
            ) : (
              <Stack gap={4}>
                <ImageUpload
                  multiple
                  mediaType="image"
                  value={productUploadValue}
                  onUpload={(file) => handleUpload(file, null)}
                  onRemove={handleRemove}
                  aspectRatio="square"
                  gridCols={4}
                  layout="grid"
                  enablePreviewModal={true}
                  helperText="PNG, JPG, and WEBP supported. First uploaded photo is automatically set as the storefront cover."
                />

                {productImages.length > 1 && (
                  <Card variant="subtle" className="p-3.5 border border-border">
                    <Inline
                      justify="between"
                      align="center"
                      className="flex-wrap gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <Star className="size-4 text-primary fill-primary" />
                        <Text
                          variant="caption"
                          className="font-medium text-foreground"
                        >
                          Primary Storefront Image:
                        </Text>
                        <span className="text-xs text-muted-foreground font-mono">
                          {(
                            productImages.find((i) => i.isPrimary) ||
                            productImages[0]
                          )?.storageKey
                            .split("/")
                            .pop()}
                        </span>
                      </div>
                      <Inline gap={1.5} align="center">
                        <Text variant="caption" foreground="muted">
                          Set as primary:
                        </Text>
                        {productImages.map((img, idx) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => handleSetPrimary(img.id)}
                            className={[
                              "px-2.5 py-1 rounded text-xs font-medium border transition-colors",
                              img.isPrimary
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-muted-foreground border-border hover:border-primary/50",
                            ].join(" ")}
                          >
                            Image #{idx + 1}
                          </button>
                        ))}
                      </Inline>
                    </Inline>
                  </Card>
                )}
              </Stack>
            )}
          </Stack>
        </Card>

        {/* Section 2: Variant Specific Media */}
        <Card variant="subtle" className="p-5">
          <Stack gap={4}>
            <Inline justify="between" align="start" className="flex-wrap gap-2">
              <div>
                <Inline gap={2} align="center">
                  <Text
                    variant="subtitle-1"
                    className="font-semibold text-foreground"
                  >
                    Variant Media
                  </Text>
                  <Badge variant="subtle" size="sm">
                    {totalVariantImages} photo
                    {totalVariantImages === 1 ? "" : "s"} assigned
                  </Badge>
                </Inline>
                <Text variant="caption" foreground="muted">
                  Assign specific photos to product variants. When customers
                  pick a variant on the storefront, the gallery switches to
                  these photos.
                </Text>
              </div>
            </Inline>

            {variants.length === 0 ? (
              <Card variant="subtle" className="p-8 text-center border-dashed">
                <Stack gap={1.5} align="center">
                  <Layers className="size-6 text-muted-foreground mb-1" />
                  <Text
                    variant="body-2"
                    className="font-medium text-foreground"
                  >
                    No variants defined
                  </Text>
                  <Text variant="caption" foreground="muted">
                    Variants defined in Step 3 will appear here for
                    variant-specific photo uploads.
                  </Text>
                </Stack>
              </Card>
            ) : (
              <Stack gap={4}>
                {/* Variant Selector Pills */}
                <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                  {variants.map((v) => {
                    const count = images.filter(
                      (img) => img.variantId === v.id,
                    ).length;
                    const isSelected = v.id === activeVariantId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={[
                          "px-3 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center gap-2",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-card text-foreground border-border hover:border-primary/50",
                        ].join(" ")}
                      >
                        <span className="font-mono uppercase font-semibold">
                          {v.sku}
                        </span>
                        {v.isDefault && (
                          <span className="text-[10px] opacity-80 uppercase tracking-wide">
                            (Default)
                          </span>
                        )}
                        <span
                          className={[
                            "px-1.5 py-0.5 rounded-full text-[10px] font-mono",
                            isSelected
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          ].join(" ")}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Upload Zone for the Selected Variant */}
                {activeVariant ? (
                  <Stack gap={3}>
                    <Inline justify="between" align="center">
                      <Text
                        variant="caption"
                        className="font-medium text-foreground"
                      >
                        Photos for variant:{" "}
                        <span className="font-mono font-bold text-primary">
                          {activeVariant.sku}
                        </span>{" "}
                        ({activeVariantImages.length} uploaded)
                      </Text>
                    </Inline>

                    <ImageUpload
                      key={activeVariant.id}
                      multiple
                      mediaType="image"
                      value={variantUploadValue}
                      onUpload={(file) => handleUpload(file, activeVariant.id)}
                      onRemove={handleRemove}
                      aspectRatio="square"
                      gridCols={4}
                      layout="grid"
                      enablePreviewModal={true}
                      helperText={`Photos uploaded here are assigned directly to SKU ${activeVariant.sku}.`}
                    />
                  </Stack>
                ) : null}
              </Stack>
            )}
          </Stack>
        </Card>

        {/* Hidden button for programmatic submit from wizard footer */}
        <button
          type="submit"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </Stack>
    </form>
  );
};
