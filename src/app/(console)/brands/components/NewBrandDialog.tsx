"use client";

import React, { useState } from "react";
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
  Button,
  Stack,
  Alert,
  ImageUpload,
} from "@timmbr/ui";
import { mediaApi } from "@/lib/api";
import { generateSlug } from "@/lib/utils/slug";
import { brandApi } from "../api";
import { revalidateBrands } from "../actions";
import type { BrandStatus } from "../types";

export interface NewBrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FormState {
  name: string;
  description: string;
  logoUrl: string | null;
  status: BrandStatus;
}

interface FormErrors {
  name?: string;
  description?: string;
  general?: string;
}

const STATUS_OPTIONS: { value: BrandStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ARCHIVED", label: "Archived" },
];

const INITIAL_FORM_STATE: FormState = {
  name: "",
  description: "",
  logoUrl: null,
  status: "ACTIVE",
};

export const NewBrandDialog: React.FC<NewBrandDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setForm(INITIAL_FORM_STATE);
    setUploadedKey(null);
    setErrors({});
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, name: e.target.value }));
    if (errors.name)
      setErrors((prev) => ({ ...prev, name: undefined, general: undefined }));
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, description: e.target.value }));
    if (errors.description)
      setErrors((prev) => ({
        ...prev,
        description: undefined,
        general: undefined,
      }));
  };

  const handleImageUpload = async (file: File) => {
    const result = await mediaApi.uploadMedia(file, "brands");
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
      newErrors.name = "Brand name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (form.name.trim().length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
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
      await brandApi.createBrand({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        logoUrl: form.logoUrl || undefined,
        status: form.status,
      });

      await revalidateBrands();
      handleOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create brand. Please check your inputs and try again.";
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const slugPreview = form.name.trim() ? `/${generateSlug(form.name)}` : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-sans">
            Create New Brand
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add a new brand identity or manufacturer label to your catalog.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <DialogBody className="space-y-5">
            {errors.general && (
              <Alert variant="destructive" title="Creation Failed">
                {errors.general}
              </Alert>
            )}

            <Stack gap={4}>
              <FormField
                label="Brand Name"
                required
                error={errors.name}
                helperText={
                  slugPreview
                    ? `URL slug will be generated as: ${slugPreview}`
                    : "The official brand name (e.g., Ashley Furniture, La-Z-Boy)."
                }
              >
                <Input
                  placeholder="e.g. Ashley Furniture"
                  value={form.name}
                  onChange={handleNameChange}
                  disabled={isSubmitting}
                  error={errors.name}
                  autoFocus
                />
              </FormField>

              <FormField
                label="Status"
                helperText="Control the visibility of this brand in the catalog."
              >
                <Select
                  options={STATUS_OPTIONS}
                  value={form.status}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, status: val as BrandStatus }))
                  }
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField
                label="Description"
                error={errors.description}
                helperText="Optional 10-200 character summary of the brand."
              >
                <Textarea
                  placeholder="Briefly describe this brand or manufacturer..."
                  value={form.description}
                  onChange={handleDescriptionChange}
                  disabled={isSubmitting}
                  rows={3}
                  error={errors.description}
                />
              </FormField>

              <ImageUpload
                label="Brand Logo"
                value={form.logoUrl}
                onUpload={handleImageUpload}
                onRemove={handleImageRemove}
                disabled={isSubmitting}
                aspectRatio="square"
                helperText="Upload a brand logo (PNG, JPG, or WEBP up to 5MB)."
                className="w-auto shrink-0 max-w-xs"
              />
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
              loadingText="Creating brand..."
            >
              Create Brand
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
