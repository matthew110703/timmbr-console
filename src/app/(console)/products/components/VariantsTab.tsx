"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Stack,
  Button,
  DataTable,
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
  toast,
  type ColumnDef,
} from "@timmbr/ui";
import { Plus } from "lucide-react";
import { productApi } from "../api";
import { strings } from "../strings";
import { useProductWorkspace } from "./ProductWorkspaceContext";
import type { ProductVariant, VariantStatus } from "../types";
import { revalidateProduct } from "../actions";
import { attributeApi } from "@/app/(console)/attributes/api";
import type { AttributeDefinition } from "@/app/(console)/attributes/types";

type VariantRow = ProductVariant & {
  _isNew?: boolean;
  _draft?: Partial<ProductVariant>;
};

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DISCONTINUED", label: "Discontinued" },
];

const CREATE_VARIANT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const VariantsTab: React.FC = () => {
  const { productId, variants, setVariants, setTabDirty, registerSaveHandler } =
    useProductWorkspace();

  const [drafts, setDrafts] = useState<Record<string, Partial<ProductVariant>>>(
    {},
  );
  const [variantDefs, setVariantDefs] = useState<AttributeDefinition[]>([]);
  const [variantOptionsMap, setVariantOptionsMap] = useState<
    Record<string, { label: string; slug: string }[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Load variants and variant-level attribute definitions
  const loadData = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const [vars, defsRes] = await Promise.all([
        productApi.getVariants(productId),
        attributeApi
          .getAttributeDefinitions({
            limit: 100,
            scope: "VARIANT",
          })
          .catch(() => ({ data: [] })),
      ]);
      setVariants(vars);
      const defs = (defsRes?.data || []).filter((d) => d.scope === "VARIANT");
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
      setVariantOptionsMap(opts);
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }, [productId, setVariants]);

  useEffect(() => {
    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) {
        loadData();
      }
    });
    return () => {
      ignore = true;
    };
  }, [loadData]);

  const isDirty = Object.keys(drafts).length > 0;

  useEffect(() => {
    setTabDirty("variants", isDirty);
  }, [isDirty, setTabDirty]);

  const updateDraft = (id: string, patch: Partial<ProductVariant>) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  };

  const saveVariants = useCallback(async (): Promise<boolean> => {
    if (!productId) return false;
    setSaving(true);
    try {
      for (const [variantId, patch] of Object.entries(drafts)) {
        await productApi.updateVariant(productId, variantId, {
          sku: patch.sku,
          price: patch.price,
          compareAtPrice: patch.compareAtPrice,
          currency: patch.currency,
          status: patch.status,
          isDefault: patch.isDefault,
        });
      }
      const fresh = await productApi.getVariants(productId);
      setVariants(fresh);
      setDrafts({});
      setTabDirty("variants", false);
      await revalidateProduct(productId);
      toast.success(strings.toasts.variantSaved);
      return true;
    } catch {
      toast.error(strings.toasts.error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [drafts, productId, setTabDirty, setVariants]);

  useEffect(() => {
    registerSaveHandler("variants", saveVariants);
  }, [registerSaveHandler, saveVariants]);

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
    if (!productId) return;

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

    setSaving(true);
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
            // Non-blocking attribute assignment
          }
        }
      }

      const fresh = await productApi.getVariants(productId);
      setVariants(fresh);
      setDialogOpen(false);
      setNewSku("");
      setNewPrice("");
      setNewCompareAt("");
      setSelectedAttributes({});
      setFieldErrors({});
      await revalidateProduct(productId);
      toast.success(strings.toasts.variantSaved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : strings.toasts.error);
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (variantId: string) => {
    if (!productId) return;
    try {
      await productApi.updateVariant(productId, variantId, { isDefault: true });
      const fresh = await productApi.getVariants(productId);
      setVariants(fresh);
      await revalidateProduct(productId);
      toast.success("Default variant updated");
    } catch {
      toast.error(strings.toasts.error);
    }
  };

  const columns = useMemo<ColumnDef<VariantRow>[]>(
    () => [
      {
        id: "default",
        header: strings.workspace.variants.default,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <input
              type="radio"
              name="default-variant"
              aria-label={`Set ${row.original.sku} as default variant`}
              checked={row.original.isDefault}
              onChange={() => handleSetDefault(row.original.id)}
              className="accent-primary size-4 cursor-pointer"
            />
          </div>
        ),
        size: 56,
      },
      {
        accessorKey: "sku",
        header: strings.workspace.variants.sku,
        cell: ({ row }) => {
          const draft = drafts[row.original.id];
          return (
            <Input
              size="sm"
              value={draft?.sku ?? row.original.sku}
              onChange={(e) =>
                updateDraft(row.original.id, {
                  sku: e.target.value.toUpperCase(),
                })
              }
              className="font-mono text-xs uppercase"
            />
          );
        },
      },
      {
        accessorKey: "price",
        header: strings.workspace.variants.price,
        cell: ({ row }) => {
          const draft = drafts[row.original.id];
          const val = draft?.price ?? row.original.price;
          return (
            <Input
              size="sm"
              type="number"
              min={0}
              step={0.01}
              value={val}
              onChange={(e) =>
                updateDraft(row.original.id, {
                  price: parseFloat(e.target.value) || 0,
                })
              }
              leftAdornment={
                <span className="text-xs font-semibold text-muted-foreground">
                  ₹
                </span>
              }
            />
          );
        },
      },
      {
        accessorKey: "compareAtPrice",
        header: "MRP (₹)",
        cell: ({ row }) => {
          const draft = drafts[row.original.id];
          const val =
            draft?.compareAtPrice !== undefined
              ? draft.compareAtPrice
              : (row.original.compareAtPrice ?? "");
          return (
            <Input
              size="sm"
              type="number"
              min={0}
              step={0.01}
              value={val ?? ""}
              placeholder="—"
              onChange={(e) =>
                updateDraft(row.original.id, {
                  compareAtPrice: e.target.value
                    ? parseFloat(e.target.value)
                    : null,
                })
              }
              leftAdornment={
                <span className="text-xs font-semibold text-muted-foreground">
                  ₹
                </span>
              }
            />
          );
        },
      },
      {
        accessorKey: "currency",
        header: strings.workspace.variants.currency,
        cell: ({ row }) => (
          <span className="text-xs font-medium font-mono text-muted-foreground">
            {row.original.currency}
          </span>
        ),
        size: 72,
      },
      {
        accessorKey: "status",
        header: strings.workspace.variants.status,
        cell: ({ row }) => {
          const draft = drafts[row.original.id];
          const status = (draft?.status ??
            row.original.status) as VariantStatus;
          return (
            <Select
              size="sm"
              value={status}
              onValueChange={(v) =>
                updateDraft(row.original.id, { status: v as VariantStatus })
              }
              options={STATUS_OPTIONS}
            />
          );
        },
      },
    ],
    [drafts],
  );

  if (!productId) return null;

  return (
    <Card variant="subtle" className="p-5">
      <Stack gap={5}>
        <Inline justify="between" align="center" className="flex-wrap gap-2">
          <div>
            <Text
              variant="subtitle-1"
              className="font-semibold text-foreground"
            >
              Product Variants & Pricing
            </Text>
            <Text variant="caption" foreground="muted">
              Configure SKUs, pricing, maximum retail price (MRP), and default
              selection.
            </Text>
          </div>
          <Button
            size="sm"
            leftIcon={<Plus className="size-4" />}
            onClick={handleOpenAddDialog}
          >
            {strings.workspace.variants.add}
          </Button>
        </Inline>

        {variants.length > 0 ? (
          <DataTable
            size="sm"
            data={variants}
            columns={columns}
            stickyHeader
            containerClassName="max-h-[min(480px,55vh)] rounded-lg border border-border"
          />
        ) : (
          <Card variant="subtle" className="p-8 text-center border-dashed">
            <Text variant="caption" foreground="muted">
              {strings.workspace.variants.empty}
            </Text>
          </Card>
        )}

        {/* Add Variant Dialog with 2-Column Layout */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            className="max-w-2xl sm:max-w-3xl"
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-sans">
                {strings.workspace.variants.add}
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
                                options={options.map((opt) => ({
                                  value: opt.slug,
                                  label: opt.label,
                                }))}
                              />
                            </FormField>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-1 items-center justify-center p-6 text-center">
                        <Text variant="caption" foreground="muted">
                          No variant attributes defined in your catalog.
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
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateVariant}
                disabled={saving || !newSku.trim() || !newPrice}
                loading={saving}
                loadingText="Adding..."
              >
                {strings.workspace.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Stack>
    </Card>
  );
};
