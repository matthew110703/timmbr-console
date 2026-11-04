"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  Stack,
  FormField,
  Input,
  Textarea,
  Select,
  RichTextEditor,
  Text,
  Inline,
  Alert,
} from "@timmbr/ui";
import { generateSlug } from "@/lib/utils/slug";
import { productApi } from "../api";
import { strings } from "../strings";
import {
  productInfoSchema,
  zodResolver,
  type ProductInfoFormValues,
} from "../validationSchema";
import { useProductWorkspace } from "./ProductWorkspaceContext";
import { revalidateProduct } from "../actions";
import { ApiError } from "@/lib/api/client";
import {
  decodeProductDescriptionForForm,
  encodeProductDescriptionForApi,
} from "../lib/productDescription";

export const ProductInfoTab: React.FC = () => {
  const {
    product,
    productId,
    isCreateMode,
    categories,
    brands,
    setProduct,
    setProductId,
    setTabDirty,
    registerSaveHandler,
  } = useProductWorkspace();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductInfoFormValues>({
    resolver: zodResolver(productInfoSchema),
    defaultValues: {
      title: product?.title ?? "",
      shortDescription: product?.shortDescription ?? "",
      categoryId: product?.categoryId ?? "",
      brandId: product?.brandId ?? "",
      hsnCode: product?.hsnCode ?? "",
      gstRate: product?.gstRate ?? 18,
      fullDescription: decodeProductDescriptionForForm(product?.description),
      status: product?.status,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        shortDescription: product.shortDescription,
        categoryId: product.categoryId,
        brandId: product.brandId ?? "",
        hsnCode: product.hsnCode ?? "",
        gstRate: product.gstRate ?? 18,
        fullDescription: decodeProductDescriptionForForm(product.description),
        status: product.status,
      });
    }
  }, [product, reset]);

  useEffect(() => {
    setTabDirty("info", isDirty);
  }, [isDirty, setTabDirty]);

  const title = watch("title");
  const shortDescription = watch("shortDescription");
  const fullDescription = watch("fullDescription");

  const saveInfo = async (): Promise<boolean> => {
    let success = false;
    await handleSubmit(
      async (values) => {
        const description = encodeProductDescriptionForApi(
          values.fullDescription,
        );

        const base = {
          title: values.title.trim(),
          shortDescription: values.shortDescription.trim(),
          categoryId: values.categoryId,
          gstRate: values.gstRate,
          hsnCode: values.hsnCode?.trim() || undefined,
          brandId: values.brandId?.trim() ? values.brandId : undefined,
        };

        try {
          if (productId) {
            const updated = await productApi.updateProduct(productId, {
              ...base,
              brandId: values.brandId?.trim() ? values.brandId : null,
              description: description ?? null,
            });
            setProduct(updated);
            await revalidateProduct(productId);
          } else {
            const created = await productApi.createProduct({
              ...base,
              ...(description ? { description } : {}),
            });
            setProduct(created);
            setProductId(created.id);
            await revalidateProduct(created.id);
          }
          setTabDirty("info", false);
          success = true;
        } catch (err) {
          if (err instanceof ApiError && err.statusCode === 409) {
            setError("title", { message: err.message });
          }
          success = false;
        }
      },
      () => {
        success = false;
      },
    )();
    return success;
  };

  useEffect(() => {
    registerSaveHandler("info", saveInfo);
  });

  const categoryOptions = categories
    .filter((c) => c.status === "ACTIVE")
    .map((c) => ({ value: c.id, label: c.name }));

  const brandOptions = [
    { value: "", label: strings.workspace.fields.brandNone },
    ...brands.map((b) => ({ value: b.id, label: b.name })),
  ];

  return (
    <Card variant="subtle" className="p-5">
      <Stack gap={5}>
        <div>
          <Text variant="subtitle-1" className="font-semibold text-foreground">
            Basic Information
          </Text>
          <Text variant="caption" foreground="muted">
            Configure titles, descriptions, and catalog classification.
          </Text>
        </div>

        {/* Title */}
        <FormField
          label={strings.workspace.fields.title}
          required
          error={errors.title?.message}
          helperText="Public title displayed on storefront listings and search results."
        >
          <Input
            size="sm"
            {...register("title")}
            placeholder="e.g. Kyoto Solid Teak Dining Table"
          />
        </FormField>

        {/* Short Description */}
        <FormField
          label={strings.workspace.fields.shortDescription}
          required
          error={errors.shortDescription?.message}
        >
          <Textarea
            size="sm"
            rows={2}
            maxLength={250}
            showCount
            helperText="Quick summary shown on product summary cards (max 250 characters)."
            {...register("shortDescription")}
            placeholder="Brief product highlight for cards and previews..."
          />
        </FormField>

        {/* Full Description with RichTextEditor */}
        <FormField
          label="Full Description"
          helperText="Comprehensive product story, materials, craftsmanship, dimensions, and care instructions."
        >
          <RichTextEditor
            placeholder="Detailed product story, materials, craftsmanship, dimensions, and care instructions..."
            value={fullDescription || ""}
            onChange={(html) =>
              setValue("fullDescription", html, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            toolbar
            toolbarClassName="sticky top-0 z-10 bg-card border-b border-border shadow-xs"
            className="flex flex-col rounded-lg border border-border"
            editorClassName="min-h-[160px]"
            maxCharacters={10000}
            showCharacterCount
          />
        </FormField>

        {/* Category + Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={strings.workspace.fields.category}
            required
            error={errors.categoryId?.message}
            helperText="Classification for navigation and attribute inheritance."
          >
            <Select
              size="sm"
              value={watch("categoryId")}
              onValueChange={(v) =>
                setValue("categoryId", v, { shouldDirty: true })
              }
              options={categoryOptions}
              placeholder="Select category"
            />
          </FormField>

          <FormField
            label={strings.workspace.fields.brand}
            helperText="Brand manufacturer or collection."
          >
            <Select
              size="sm"
              value={watch("brandId") ?? ""}
              onValueChange={(v) =>
                setValue("brandId", v, { shouldDirty: true })
              }
              options={brandOptions}
            />
          </FormField>
        </div>

        {/* HSN + GST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={strings.workspace.fields.hsn}
            error={errors.hsnCode?.message}
            helperText="Harmonized System of Nomenclature code (4, 6, or 8 digits)."
          >
            <Input size="sm" {...register("hsnCode")} placeholder="e.g. 9403" />
          </FormField>

          <FormField
            label={strings.workspace.fields.gst}
            error={errors.gstRate?.message}
            helperText="Applicable Goods and Services Tax percentage (default: 18%)."
          >
            <Input
              size="sm"
              type="number"
              min={0}
              max={100}
              step={0.01}
              {...register("gstRate")}
              placeholder="18"
            />
          </FormField>
        </div>

        {/* URL Slug Preview */}
        <Card variant="subtle" className="p-3.5 border border-border">
          <Inline justify="between" align="center" className="flex-wrap gap-2">
            <Stack gap={0.5}>
              <Text variant="caption" foreground="muted">
                {strings.workspace.slugPreview}
              </Text>
              <Text
                variant="body-3"
                className="font-mono text-muted-foreground break-all"
              >
                /products/{title ? generateSlug(title) : "—"}
              </Text>
            </Stack>
            <Text variant="caption" foreground="muted">
              {strings.workspace.slugNote}
            </Text>
          </Inline>
        </Card>

        {errors.root ? (
          <Alert variant="destructive" title={String(errors.root.message)} />
        ) : null}
      </Stack>
    </Card>
  );
};
