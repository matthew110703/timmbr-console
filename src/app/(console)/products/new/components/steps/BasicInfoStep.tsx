"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Stack,
  FormField,
  Input,
  Textarea,
  Select,
  RichTextEditor,
  Text,
  Alert,
} from "@timmbr/ui";
import { generateSlug } from "@/lib/utils/slug";
import { productApi } from "../../../api";
import { revalidateProducts } from "../../../actions";
import {
  basicInfoSchema,
  zodResolver,
  type BasicInfoFormValues,
} from "../../../validationSchema";
import { ApiError } from "@/lib/api/client";
import {
  decodeProductDescriptionForForm,
  encodeProductDescriptionForApi,
} from "../../../lib/productDescription";
import type { Category } from "@/app/(console)/categories/types";
import type { Brand } from "@/app/(console)/brands/types";

interface BasicInfoStepProps {
  productId?: string | null;
  categories: Category[];
  brands: Brand[];
  onSuccess: (productId: string) => void;
  onValuesChange?: (values: Partial<BasicInfoFormValues>) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  productId,
  categories,
  brands,
  onSuccess,
  onValuesChange,
}) => {
  const [rootError, setRootError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      categoryId: "",
      brandId: "",
      hsnCode: "",
      gstRate: 18,
      description: "",
    },
  });

  const title = watch("title");
  const shortDescription = watch("shortDescription");
  const categoryId = watch("categoryId");
  const brandId = watch("brandId");

  // Load existing product if resuming a draft
  useEffect(() => {
    if (!productId) return;
    let isMounted = true;
    setIsLoadingExisting(true);

    productApi
      .getProduct(productId)
      .then((prod) => {
        if (!isMounted || !prod) return;
        reset({
          title: prod.title || "",
          shortDescription: prod.shortDescription || "",
          categoryId: prod.categoryId || "",
          brandId: prod.brandId || "",
          hsnCode: prod.hsnCode || "",
          gstRate: prod.gstRate ?? 18,
          description: decodeProductDescriptionForForm(prod.description),
        });
        onValuesChange?.({
          title: prod.title,
          shortDescription: prod.shortDescription,
          categoryId: prod.categoryId,
          brandId: prod.brandId || undefined,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingExisting(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, reset, onValuesChange]);

  // Report live values for preview card
  useEffect(() => {
    onValuesChange?.({ title, shortDescription, categoryId, brandId });
  }, [title, shortDescription, categoryId, brandId, onValuesChange]);

  const onSubmit = async (values: BasicInfoFormValues) => {
    setRootError(null);
    setIsSubmitting(true);
    try {
      const description = encodeProductDescriptionForApi(values.description);

      if (productId) {
        // Update existing draft
        await productApi.updateProduct(productId, {
          title: values.title.trim(),
          shortDescription: values.shortDescription.trim(),
          categoryId: values.categoryId,
          brandId: values.brandId?.trim() || null,
          description: description ?? null,
          hsnCode: values.hsnCode?.trim() || undefined,
          gstRate: values.gstRate ?? 18,
        });
        await revalidateProducts();
        onSuccess(productId);
      } else {
        // Create new draft
        const product = await productApi.createProduct({
          title: values.title.trim(),
          shortDescription: values.shortDescription.trim(),
          categoryId: values.categoryId,
          brandId: values.brandId?.trim() || undefined,
          ...(description ? { description } : {}),
          hsnCode: values.hsnCode?.trim() || undefined,
          gstRate: values.gstRate ?? 18,
        });
        await revalidateProducts();
        onSuccess(product.id);
      }
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setError("title", {
          message: "A product with this name already exists",
        });
      } else {
        setRootError("Failed to save product details. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = categories
    .filter((c) => c.status === "ACTIVE")
    .map((c) => ({ value: c.id, label: c.name }));

  const brandOptions = [
    { value: "", label: "No brand" },
    ...brands.map((b) => ({ value: b.id, label: b.name })),
  ];

  const derivedSlug = title ? generateSlug(title) : "";

  return (
    <form
      id="basic-info-step-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Stack gap={5}>
        {rootError && <Alert variant="destructive">{rootError}</Alert>}

        {isLoadingExisting && (
          <Text variant="caption" foreground="muted">
            Loading draft details...
          </Text>
        )}

        {/* Title */}
        <FormField label="Product Name" required error={errors.title?.message}>
          <Input
            {...register("title")}
            placeholder="e.g. Cotton Kurta Set"
            maxLength={100}
            disabled={isSubmitting}
          />
          <span className="mt-1 block text-right text-xs text-muted-foreground">
            {(title || "").length}/100
          </span>
        </FormField>

        {/* Slug preview */}
        {derivedSlug && (
          <div className="-mt-3">
            <Text variant="caption" foreground="muted">
              URL: <span className="font-mono">/{derivedSlug}</span>
            </Text>
          </div>
        )}

        {/* Short description */}
        <FormField
          label="Short Description"
          required
          error={errors.shortDescription?.message}
        >
          <Textarea
            {...register("shortDescription")}
            placeholder="Briefly describe this product…"
            rows={3}
            maxLength={250}
            showCount
            autoResize
            disabled={isSubmitting}
            helperText="Shown in product cards and search results"
          />
        </FormField>

        {/* Full description */}
        <FormField
          label="Full Description"
          helperText="Rich text editor with sticky toolbar."
        >
          <RichTextEditor
            value={watch("description") ?? ""}
            onChange={(html) =>
              setValue("description", html, { shouldDirty: true })
            }
            placeholder="Describe materials, sizing, care instructions…"
            toolbar
            toolbarClassName="sticky top-0 z-10 bg-card border-b border-border shadow-xs"
            className="flex flex-col rounded-lg border border-border"
            editorClassName="min-h-[160px]"
            maxCharacters={10000}
            showCharacterCount
          />
        </FormField>

        {/* Category + Brand */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Category"
            required
            error={errors.categoryId?.message}
          >
            <Select
              value={watch("categoryId")}
              onValueChange={(v) =>
                setValue("categoryId", v, { shouldDirty: true })
              }
              options={categoryOptions}
              placeholder="Select a category"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Brand">
            <Select
              value={watch("brandId") ?? ""}
              onValueChange={(v) =>
                setValue("brandId", v, { shouldDirty: true })
              }
              options={brandOptions}
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* HSN + GST */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="HSN Code"
            error={errors.hsnCode?.message}
            helperText="4, 6, or 8 digit HSN code"
          >
            <Input
              {...register("hsnCode")}
              placeholder="e.g. 6209"
              inputMode="numeric"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label="GST Rate (%)"
            error={errors.gstRate?.message}
            helperText="Default: 18%"
          >
            <Input
              {...register("gstRate")}
              type="number"
              min={0}
              max={100}
              step={0.01}
              placeholder="18"
              disabled={isSubmitting}
            />
          </FormField>
        </div>
      </Stack>

      {/* Hidden submit button — triggered via form="basic-info-step-form" */}
      <button
        type="submit"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
    </form>
  );
};
