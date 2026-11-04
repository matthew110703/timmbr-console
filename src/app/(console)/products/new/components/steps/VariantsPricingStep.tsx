"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Stack,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  FormField,
  Input,
  Select,
  Switch,
  Inline,
  Text,
  Badge,
  Alert,
  toast,
} from "@timmbr/ui";
import { Plus, SlidersHorizontal } from "lucide-react";
import { productApi } from "../../../api";
import { strings } from "../../../strings";
import type { ProductVariant, VariantStatus } from "../../../types";
import { attributeApi } from "@/app/(console)/attributes/api";
import type { AttributeDefinition } from "@/app/(console)/attributes/types";

export interface VariantsPricingStepProps {
  productId: string;
  onSuccess?: () => void;
  onBack?: () => void;
  onPriceChange?: (priceDisplay: string) => void;
}

const CREATE_VARIANT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const VariantsPricingStep: React.FC<VariantsPricingStepProps> = ({
  productId,
  onSuccess,
  onPriceChange,
}) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantDefs, setVariantDefs] = useState<AttributeDefinition[]>([]);
  const [variantOptionsMap, setVariantOptionsMap] = useState<
    Record<string, { label: string; slug: string }[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New variant dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSku, setNewSku] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCompareAt, setNewCompareAt] = useState("");
  const [newStatus, setNewStatus] = useState<VariantStatus>("ACTIVE");
  const [isDefault, setIsDefault] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch variants and variant-scoped attribute definitions
  useEffect(() => {
    if (!productId) return;
    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) {
        setLoading(true);
        setError(null);
      }
    });
    Promise.all([
      productApi.getVariants(productId),
      attributeApi.getAttributeDefinitions({
        limit: 100,
        scope: "VARIANT",
      }),
    ])
      .then(async ([vars, defsRes]) => {
        if (ignore) return;
        setVariants(vars);
        const defs = defsRes.data.filter((d) => d.scope === "VARIANT");
        setVariantDefs(defs);

        const opts: Record<string, { label: string; slug: string }[]> = {};
        await Promise.all(
          defs.map(async (d) => {
            try {
              const options = await attributeApi.getOptions(d.id);
              opts[d.id] = options.map((o) => ({
                label: o.label,
                slug: o.slug,
              }));
            } catch {
              opts[d.id] = [];
            }
          }),
        );
        if (ignore) return;
        setVariantOptionsMap(opts);

        if (vars.length > 0) {
          const prices = vars
            .map((v) => v.price)
            .filter((p) => p !== undefined);
          if (prices.length > 0) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            const display =
              min === max
                ? `₹${min.toLocaleString("en-IN")}`
                : `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}`;
            onPriceChange?.(display);
          }
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : strings.toasts.error);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [productId, onPriceChange]);

  const handleOpenAddDialog = () => {
    setNewSku("");
    setNewPrice("");
    setNewCompareAt("");
    setNewStatus("ACTIVE");
    setIsDefault(variants.length === 0);
    setSelectedAttributes({});
    setFieldErrors({});
    setDialogOpen(true);
  };

  const handleCreateVariant = async () => {
    const errors: Record<string, string> = {};
    if (!newSku.trim()) errors.sku = "SKU is required";
    if (!newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) < 0) {
      errors.price = "Enter a valid price";
    }
    if (
      newCompareAt &&
      (isNaN(parseFloat(newCompareAt)) || parseFloat(newCompareAt) < 0)
    ) {
      errors.compareAt = "Enter a valid compare-at price";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const created = await productApi.createVariant(productId, {
        sku: newSku.trim(),
        price: parseFloat(newPrice),
        compareAtPrice: newCompareAt ? parseFloat(newCompareAt) : undefined,
        currency: "INR",
        status: newStatus,
        isDefault: isDefault || variants.length === 0,
      });

      // Assign variant attributes if selected
      for (const [defId, val] of Object.entries(selectedAttributes)) {
        if (val) {
          try {
            await productApi.assignVariantAttribute(productId, created.id, {
              definitionId: defId,
              value: val,
            });
          } catch {
            // Non-blocking attribute assignment failure
          }
        }
      }

      const updated = [...variants, created];
      setVariants(updated);
      setDialogOpen(false);
      toast.success(strings.toasts.variantSaved);

      // Recalculate price
      const prices = updated.map((v) => v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const display =
        min === max
          ? `₹${min.toLocaleString("en-IN")}`
          : `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}`;
      onPriceChange?.(display);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : strings.toasts.error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (variantId: string) => {
    try {
      await productApi.updateVariant(productId, variantId, { isDefault: true });
      const fresh = await productApi.getVariants(productId);
      setVariants(fresh);
      toast.success("Default variant updated");
    } catch {
      toast.error(strings.toasts.error);
    }
  };

  const handleSubmitStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (variants.length === 0) {
      setError("At least one variant must be created before proceeding.");
      return;
    }
    onSuccess?.();
  };

  return (
    <form id="variants-step-form" onSubmit={handleSubmitStep}>
      <Stack gap={5}>
        <Inline justify="between" align="start">
          <div>
            <Text
              variant="subtitle-1"
              className="font-semibold text-foreground"
            >
              Variants &amp; Pricing
            </Text>
            <Text variant="caption" foreground="muted">
              Add individual sellable items with distinct SKUs, prices, and
              default flags.
            </Text>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleOpenAddDialog}
            leftIcon={<Plus className="size-4" />}
          >
            Add Variant
          </Button>
        </Inline>

        {error && <Alert variant="destructive">{error}</Alert>}

        {loading ? (
          <Card variant="subtle" className="p-8 text-center border-dashed">
            <Text variant="caption" foreground="muted">
              Loading variants...
            </Text>
          </Card>
        ) : variants.length === 0 ? (
          <Card
            variant="subtle"
            className="p-8 border border-dashed rounded-xl"
          >
            <Stack gap={3} align="center" className="text-center">
              <SlidersHorizontal className="size-8 text-muted-foreground/40" />
              <Text variant="body-2" foreground="muted">
                {strings.workspace.variants.empty}
              </Text>
              <Text variant="caption" foreground="muted">
                Every product needs at least one variant with a SKU and pricing.
              </Text>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleOpenAddDialog}
                leftIcon={<Plus className="size-4" />}
              >
                Add Default Variant
              </Button>
            </Stack>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 w-16">Default</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Price (INR)</th>
                  <th className="px-4 py-3">MRP</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {variants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        name="default-variant"
                        checked={variant.isDefault}
                        onChange={() => handleSetDefault(variant.id)}
                        className="cursor-pointer text-primary"
                        title="Set as default variant"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono font-medium">
                      {variant.sku}
                      {variant.isDefault && (
                        <Badge variant="primary" size="sm" className="ml-2">
                          Default
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ₹{variant.price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {variant.compareAtPrice
                        ? `₹${variant.compareAtPrice.toLocaleString("en-IN")}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          variant.status === "ACTIVE"
                            ? "success"
                            : variant.status === "INACTIVE"
                              ? "subtle"
                              : "outline"
                        }
                        size="sm"
                      >
                        {variant.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Variant Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            className="max-w-2xl sm:max-w-3xl"
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-sans">
                Add New Variant
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Configure specifications, SKU, and pricing for this product
                variant.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="overflow-hidden p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Left Side: SKU, Pricing, Status, Default */}
                <div className="space-y-4">
                  <FormField
                    label="SKU"
                    required
                    error={fieldErrors.sku}
                    helperText="Stock Keeping Unit (unique identifier)"
                  >
                    <Input
                      value={newSku}
                      onChange={(e) => setNewSku(e.target.value.toUpperCase())}
                      placeholder="e.g. CKS-BLUE-M"
                      autoFocus
                    />
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      label="Selling Price"
                      required
                      error={fieldErrors.price}
                      helperText="Customer price in INR"
                    >
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="1499"
                        leftAdornment={
                          <span className="text-xs font-semibold text-muted-foreground">
                            ₹
                          </span>
                        }
                      />
                    </FormField>

                    <FormField
                      label="MRP (₹)"
                      error={fieldErrors.compareAt}
                      helperText="Maximum Retail Price"
                    >
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={newCompareAt}
                        onChange={(e) => setNewCompareAt(e.target.value)}
                        placeholder="1999"
                        leftAdornment={
                          <span className="text-xs font-semibold text-muted-foreground">
                            ₹
                          </span>
                        }
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Status"
                    helperText="Inactive variants are hidden from the live storefront."
                  >
                    <Select
                      value={newStatus}
                      onValueChange={(val) =>
                        setNewStatus(val as VariantStatus)
                      }
                      options={CREATE_VARIANT_STATUS_OPTIONS}
                    />
                  </FormField>

                  {/* Default Variant Switch */}
                  <div className="rounded-lg border border-border bg-muted/20 p-3.5">
                    <Switch
                      label="Set as default variant"
                      description="Pre-selected on storefront product detail pages."
                      checked={isDefault}
                      onCheckedChange={setIsDefault}
                      disabled={variants.length === 0}
                    />
                  </div>
                </div>

                {/* Right Side: Variant Specifications (stretches to match left column exactly) */}
                <div className="relative min-h-[360px] md:min-h-0 h-full">
                  <div className="md:absolute md:inset-0 flex flex-col rounded-lg border border-border bg-muted/15 p-4 overflow-hidden">
                    <div className="border-b border-border pb-2 shrink-0">
                      <Text
                        variant="body-2"
                        className="font-semibold text-foreground"
                      >
                        Specifications
                      </Text>
                      <Text variant="caption" foreground="muted">
                        Assign variant attributes (e.g. Size, Color).
                      </Text>
                    </div>

                    {variantDefs.length > 0 ? (
                      <div className="space-y-3 overflow-y-auto pr-1.5 pt-3 flex-1 min-h-0">
                        {variantDefs.map((def) => {
                          const options = variantOptionsMap[def.id] || [];
                          return (
                            <FormField key={def.id} label={def.name}>
                              <Select
                                placeholder={`Select ${def.name}`}
                                value={selectedAttributes[def.id] || ""}
                                onValueChange={(val) =>
                                  setSelectedAttributes((prev) => ({
                                    ...prev,
                                    [def.id]: val,
                                  }))
                                }
                                options={[
                                  { value: "", label: "None" },
                                  ...options.map((opt) => ({
                                    value: opt.slug || opt.label,
                                    label: opt.label,
                                  })),
                                ]}
                              />
                            </FormField>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-1 items-center justify-center p-6 text-center">
                        <Text variant="caption" foreground="muted">
                          No variant attributes configured. You can define
                          attributes in Step 2 or proceed with SKU &amp;
                          pricing.
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateVariant}
                loading={submitting}
                loadingText="Adding..."
              >
                Add Variant
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
