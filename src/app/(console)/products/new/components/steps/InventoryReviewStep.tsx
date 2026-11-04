"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  Stack,
  Button,
  Inline,
  Text,
  Input,
  Badge,
  Alert,
  toast,
} from "@timmbr/ui";
import {
  CheckCircle2,
  Rocket,
  PackageCheck,
  AlertCircle,
  ShoppingBag,
  Layers,
  Image as ImageIcon,
  Tag,
  Check,
} from "lucide-react";
import { productApi } from "../../../api";
import { publishProduct } from "../../../lib/publishProduct";
import { revalidateProduct } from "../../../actions";
import { strings } from "../../../strings";
import type {
  InventoryRecord,
  Product,
  ProductImage,
  ProductVariant,
} from "../../../types";
import { useProductDraft } from "../../hooks/useProductDraft";

export interface InventoryReviewStepProps {
  productId: string;
  onFinish?: (action: "draft" | "publish") => void;
}

interface VariantInventoryRow extends ProductVariant {
  inventory?: InventoryRecord;
  draftQty: number;
}

export const InventoryReviewStep: React.FC<InventoryReviewStepProps> = ({
  productId,
  onFinish,
}) => {
  const router = useRouter();
  const draft = useProductDraft();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [rows, setRows] = useState<VariantInventoryRow[]>([]);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const [prodRes, varsRes, imgsRes] = await Promise.allSettled([
        productApi.getProduct(productId),
        productApi.getVariants(productId),
        productApi.getProductImages(productId),
      ]);

      let prodData: Product | null = null;
      if (prodRes.status === "fulfilled") {
        prodData = prodRes.value;
        setProduct(prodData);
      } else {
        console.error("Failed to load product details:", prodRes.reason);
      }

      let fetchedVars: ProductVariant[] = [];
      if (
        varsRes.status === "fulfilled" &&
        Array.isArray(varsRes.value) &&
        varsRes.value.length > 0
      ) {
        fetchedVars = varsRes.value;
      } else if (
        prodData &&
        Array.isArray(prodData.variants) &&
        prodData.variants.length > 0
      ) {
        fetchedVars = prodData.variants as ProductVariant[];
      }
      setVariants(fetchedVars);

      let fetchedImgs: ProductImage[] = [];
      if (imgsRes.status === "fulfilled" && Array.isArray(imgsRes.value)) {
        fetchedImgs = imgsRes.value;
      } else if (
        prodData &&
        "images" in prodData &&
        Array.isArray((prodData as { images?: unknown }).images)
      ) {
        fetchedImgs = (prodData as { images: ProductImage[] }).images;
      }
      setImages(fetchedImgs);

      if (prodRes.status === "rejected" && varsRes.status === "rejected") {
        const msg =
          prodRes.reason instanceof Error
            ? prodRes.reason.message
            : strings.toasts.error;
        setError(msg);
      }

      const rowsWithInv: VariantInventoryRow[] = await Promise.all(
        fetchedVars.map(async (v) => {
          try {
            const inv = await productApi.getInventory(v.id);
            return { ...v, inventory: inv, draftQty: inv.quantity ?? 0 };
          } catch {
            return { ...v, draftQty: 0 };
          }
        }),
      );
      setRows(rowsWithInv);
    } catch (err) {
      setError(err instanceof Error ? err.message : strings.toasts.error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    let ignore = false;
    if (!productId) return;
    Promise.resolve().then(() => {
      if (!ignore) {
        loadData();
      }
    });
    return () => {
      ignore = true;
    };
  }, [loadData, productId]);

  const handleQtyChange = (variantId: string, val: string) => {
    const qty = parseInt(val, 10);
    const parsedQty = isNaN(qty) ? 0 : Math.max(0, qty);

    setRows((prev) =>
      prev.map((row) =>
        row.id === variantId ? { ...row, draftQty: parsedQty } : row,
      ),
    );
    setDirtyIds((prev) => new Set(prev).add(variantId));
  };

  const saveInventoryChanges = async () => {
    if (dirtyIds.size === 0) return true;
    for (const variantId of Array.from(dirtyIds)) {
      const row = rows.find((r) => r.id === variantId);
      if (!row) continue;
      await productApi.updateInventory(variantId, {
        quantity: row.draftQty,
        reason: "Initial stock setup",
      });
    }
    setDirtyIds(new Set());
    return true;
  };

  const handleSaveAsDraft = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveInventoryChanges();
      await revalidateProduct(productId);
      draft.clearDraft();
      toast.success("Product saved as draft");
      if (onFinish) {
        onFinish("draft");
      } else {
        router.push("/products");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveInventoryChanges();
      await publishProduct(productId);
      await revalidateProduct(productId);
      draft.clearDraft();
      toast.success("Product published successfully");
      if (onFinish) {
        onFinish("publish");
      } else {
        router.push("/products");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to publish product",
      );
    } finally {
      setSaving(false);
    }
  };

  const primaryImage = useMemo(
    () =>
      images.find((i) => i.isPrimary) ||
      images[0] ||
      (product?.coverImage
        ? ({
            id: product.coverImage.id,
            url: product.coverImage.url,
            isPrimary: true,
            storageKey: "",
          } as ProductImage)
        : null),
    [images, product],
  );

  const priceRange = useMemo(() => {
    if (rows.length === 0) return "TBD";
    const prices = rows.map((r) => r.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max
      ? `₹${min.toLocaleString("en-IN")}`
      : `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}`;
  }, [rows]);

  const totalStock = useMemo(
    () => rows.reduce((acc, r) => acc + (r.draftQty || 0), 0),
    [rows],
  );

  const checklist = useMemo(() => {
    const hasTitle = Boolean(product?.title);
    const hasCategory = Boolean(product?.categoryId);
    const hasTax = product?.gstRate !== undefined && product?.gstRate !== null;
    const hasVariants = rows.length > 0;
    const hasDefault = rows.some((r) => r.isDefault);
    const hasMedia = images.length > 0 || Boolean(product?.coverImage);
    const hasStock = totalStock > 0;

    return [
      {
        id: "info",
        label: "Basic Details",
        description:
          hasTitle && hasCategory
            ? `${product?.title}${product?.category?.name ? ` in ${product.category.name}` : ""}`
            : "Product title and category configured",
        passed: hasTitle && hasCategory && hasTax,
      },
      {
        id: "variants",
        label: "Variants & Pricing",
        description: hasVariants
          ? `${rows.length} variant(s) defined • Price ${priceRange}${hasDefault ? " • Default SKU set" : ""}`
          : "At least one variant required",
        passed: hasVariants,
      },
      {
        id: "media",
        label: "Media Assets",
        description: hasMedia
          ? `${images.length || (product?.coverImage ? 1 : 0)} image(s) uploaded • Primary thumbnail set`
          : "No images uploaded yet",
        passed: hasMedia,
        optional: true,
      },
      {
        id: "inventory",
        label: "Opening Stock",
        description: hasStock
          ? `${totalStock} unit(s) allocated across variants`
          : "Stock quantity is 0 (can be updated later)",
        passed: hasStock,
        optional: true,
      },
    ];
  }, [product, rows, images, priceRange, totalStock]);

  const canPublish = useMemo(() => {
    return checklist
      .filter((item) => !item.optional)
      .every((item) => item.passed);
  }, [checklist]);

  if (loading) {
    return (
      <Card variant="subtle" className="p-8 text-center border-dashed">
        <Text variant="caption" foreground="muted">
          Loading product summary and inventory details...
        </Text>
      </Card>
    );
  }

  return (
    <Stack gap={6}>
      <div>
        <Text variant="subtitle-1" className="font-semibold text-foreground">
          Inventory &amp; Final Review
        </Text>
        <Text variant="caption" foreground="muted">
          Review your product setup, allocate opening stock, and publish or save
          as draft.
        </Text>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      {/* Product Summary Header Card */}
      <Card variant="outline" className="p-5">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="relative size-24 shrink-0 rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center">
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage.url}
                alt={product?.title || "Product"}
                className="size-full object-cover"
              />
            ) : (
              <ShoppingBag className="size-8 text-muted-foreground/30" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <Inline gap={2} align="center" className="flex-wrap">
              <Badge variant="subtle" size="sm">
                Draft
              </Badge>
              {product?.category && (
                <Badge variant="outline" size="sm">
                  {product.category.name}
                </Badge>
              )}
              {product?.brand && (
                <Badge variant="outline" size="sm">
                  {product.brand.name}
                </Badge>
              )}
            </Inline>

            <h2 className="text-h6 font-semibold text-foreground truncate">
              {product?.title || "Untitled Product"}
            </h2>

            {product?.shortDescription && (
              <p className="text-body-2 text-muted-foreground line-clamp-2">
                {product.shortDescription}
              </p>
            )}

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-muted-foreground border-t border-border">
              <span>
                <strong>Price:</strong> {priceRange}
              </span>
              <span>
                <strong>Variants:</strong> {rows.length}
              </span>
              <span>
                <strong>Images:</strong>{" "}
                {images.length || (product?.coverImage ? 1 : 0)}
              </span>
              {product?.hsnCode && (
                <span>
                  <strong>HSN:</strong> {product.hsnCode}
                </span>
              )}
              <span>
                <strong>GST:</strong> {product?.gstRate ?? 18}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Opening Stock Table */}
      <Card variant="outline" className="p-5">
        <Stack gap={4}>
          <Inline justify="between" align="center">
            <div>
              <Text variant="body-2" className="font-semibold text-foreground">
                Opening Stock Allocation
              </Text>
              <Text variant="caption" foreground="muted">
                Enter initial stock quantity on hand for each variant.
              </Text>
            </div>
            {dirtyIds.size > 0 && (
              <Badge variant="primary" size="sm">
                {dirtyIds.size} {dirtyIds.size === 1 ? "change" : "changes"}{" "}
                unsaved
              </Badge>
            )}
          </Inline>

          {rows.length === 0 ? (
            <Alert variant="warning">
              No variants defined. Please go back to Step 3 to add at least one
              product variant.
            </Alert>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Variant (SKU)</th>
                    <th className="px-4 py-3">Selling Price</th>
                    <th className="px-4 py-3">MRP</th>
                    <th className="px-4 py-3 w-40">Opening Stock</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 font-mono font-medium">
                        {row.sku}
                        {row.isDefault && (
                          <Badge variant="primary" size="sm" className="ml-2">
                            Default
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        ₹{row.price.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.compareAtPrice
                          ? `₹${row.compareAtPrice.toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min={0}
                          size="sm"
                          value={row.draftQty}
                          onChange={(e) =>
                            handleQtyChange(row.id, e.target.value)
                          }
                          className="w-28 font-mono"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={row.draftQty > 0 ? "success" : "subtle"}
                          size="sm"
                        >
                          {row.draftQty > 0 ? "In Stock" : "Zero Stock"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Stack>
      </Card>

      {/* Pre-flight Publishing Checklist */}
      <Card variant="outline" className="p-5">
        <Stack gap={3}>
          <div>
            <Text variant="body-2" className="font-semibold text-foreground">
              Pre-flight Checklist
            </Text>
            <Text variant="caption" foreground="muted">
              Verification checks for publishing to the live storefront.
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/10 p-3.5"
              >
                {item.passed ? (
                  <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
                ) : item.optional ? (
                  <AlertCircle className="size-5 text-warning shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {item.label}
                    </span>
                    {item.optional && (
                      <span className="text-[10px] text-muted-foreground uppercase">
                        (Optional)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Stack>
      </Card>

      {/* Completion Action Banner */}
      <Card variant="subtle" className="p-5 border border-border">
        <Stack gap={4}>
          <Inline justify="between" align="center" className="flex-wrap gap-4">
            <div>
              <Text variant="body-1" className="font-semibold text-foreground">
                Ready to complete?
              </Text>
              <Text variant="caption" foreground="muted">
                Publishing immediately surfaces this product on the live
                storefront. Or save as draft to continue later.
              </Text>
            </div>

            <Inline gap={3}>
              <Button
                variant="outline"
                size="sm"
                loading={saving}
                onClick={handleSaveAsDraft}
                leftIcon={<PackageCheck className="size-4" />}
              >
                Save as Draft &amp; Exit
              </Button>
              <Button
                size="sm"
                loading={saving}
                disabled={!canPublish}
                onClick={handlePublish}
                leftIcon={<Rocket className="size-4" />}
              >
                Publish Product
              </Button>
            </Inline>
          </Inline>
        </Stack>
      </Card>
    </Stack>
  );
};
