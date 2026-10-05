"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  FormField,
  Input,
  Textarea,
  Select,
  Switch,
  Button,
  Stack,
  Alert,
  ImageUpload,
  Inline,
} from "@timmbr/ui";
import { mediaApi } from "@/lib/api";
import { categoryApi } from "../api";
import { revalidateCategories } from "../actions";
import type { Category } from "../types";

export interface NewCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: Category[];
  onSuccess?: () => void;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  logoUrl: string | null;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  general?: string;
}

const INITIAL_FORM_STATE: FormState = {
  name: "",
  slug: "",
  description: "",
  parentId: null,
  logoUrl: null,
  isActive: true,
};

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const NewCategoryDialog: React.FC<NewCategoryDialogProps> = ({
  open,
  onOpenChange,
  categories = [],
  onSuccess,
}) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const resetForm = () => {
    setForm(INITIAL_FORM_STATE);
    setUploadedKey(null);
    setErrors({});
    setIsSlugManuallyEdited(false);
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  // Parent Category options
  const parentCategoryOptions = useMemo(() => {
    const rootOptions = [{ value: "none", label: "None (Root Category)" }];
    const categoryOptions = categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));
    return [...rootOptions, ...categoryOptions];
  }, [categories]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setForm((prev) => ({
      ...prev,
      name: newName,
      slug: isSlugManuallyEdited ? prev.slug : generateSlug(newName),
    }));
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined, general: undefined }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }));
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: undefined, general: undefined }));
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, description: e.target.value }));
    if (errors.description) {
      setErrors((prev) => ({
        ...prev,
        description: undefined,
        general: undefined,
      }));
    }
  };

  const handleImageUpload = async (file: File) => {
    const result = await mediaApi.uploadMedia(file, "categories");
    setUploadedKey(result.key);
    setForm((prev) => ({ ...prev, logoUrl: result.url }));
    return result.url;
  };

  const handleImageRemove = async () => {
    if (uploadedKey) {
      try {
        await mediaApi.deleteMedia(uploadedKey);
      } catch {
        // Silently ignore cleanup errors
      }
    }
    setUploadedKey(null);
    setForm((prev) => ({ ...prev, logoUrl: null }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (form.name.trim().length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    }

    if (form.slug.trim()) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(form.slug.trim())) {
        newErrors.slug =
          "Slug must only contain lowercase alphanumeric characters and single hyphens";
      }
    }

    if (form.description.trim()) {
      if (form.description.trim().length < 10) {
        newErrors.description =
          "Description must be at least 10 characters if provided";
      } else if (form.description.trim().length > 200) {
        newErrors.description = "Description cannot exceed 200 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await categoryApi.createCategory({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        parentId:
          form.parentId === "none" || !form.parentId ? null : form.parentId,
        logoUrl: form.logoUrl || undefined,
        status: form.isActive ? "ACTIVE" : "INACTIVE",
      });

      await revalidateCategories();
      handleOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create category. Please check your inputs and try again.";
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-sans">
            Create New Category
          </DialogTitle>
          <DialogDescription className="text-sm text-muted">
            Add a new product category or subcategory to your taxonomic catalog.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <DialogBody className="space-y-5">
            {/* General API Error Alert */}
            {errors.general && (
              <Alert variant="destructive" title="Creation Failed">
                {errors.general}
              </Alert>
            )}

            <Stack gap={4}>
              {/* Category Name */}
              <FormField
                label="Category Name"
                required
                error={errors.name}
                helperText="The customer-facing name of the category (e.g., Living Room, Bedroom)."
              >
                <Input
                  placeholder="e.g. Living Room Furniture"
                  value={form.name}
                  onChange={handleNameChange}
                  disabled={isSubmitting}
                  error={errors.name}
                  autoFocus
                />
              </FormField>

              {/* Slug */}
              <FormField
                label="URL Slug"
                error={errors.slug}
                helperText="The unique URL path for this category. Auto-generated from name."
              >
                <Input
                  placeholder="e.g. living-room-furniture"
                  value={form.slug}
                  onChange={handleSlugChange}
                  disabled={isSubmitting}
                  error={errors.slug}
                />
              </FormField>

              {/* Parent Category */}
              <FormField
                label="Parent Category"
                helperText="Assign a parent category to create a nested subcategory."
              >
                <Select
                  placeholder="Select parent category (optional)"
                  options={parentCategoryOptions}
                  value={form.parentId ?? "none"}
                  onValueChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      parentId: val === "none" ? null : val,
                    }))
                  }
                  disabled={isSubmitting}
                />
              </FormField>

              {/* Description */}
              <FormField
                label="Description"
                error={errors.description}
                helperText="Optional 10-200 character summary for SEO and catalog organization."
              >
                <Textarea
                  placeholder="Briefly describe what kinds of products belong in this category..."
                  value={form.description}
                  onChange={handleDescriptionChange}
                  disabled={isSubmitting}
                  rows={3}
                  error={errors.description}
                />
              </FormField>

              {/* Category Image Upload and Active Status Switch */}
              <Inline className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-1">
                <ImageUpload
                  label="Category Logo / Image"
                  value={form.logoUrl}
                  onUpload={handleImageUpload}
                  onRemove={handleImageRemove}
                  disabled={isSubmitting}
                  aspectRatio="square"
                  helperText="Upload a high-quality preview image (PNG, JPG, or WEBP up to 5MB)."
                  className="w-auto shrink-0 max-w-xs"
                />

                <div className="flex-1 sm:max-w-xs">
                  <Switch
                    label="Active Status"
                    description="Make this category active and visible in the catalog immediately."
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({ ...prev, isActive: checked }))
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </Inline>
            </Stack>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              loadingText="Creating category..."
            >
              Create Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
