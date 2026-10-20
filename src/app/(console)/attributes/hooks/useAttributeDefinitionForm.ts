"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@timmbr/ui";
import { revalidateByTag } from "@/lib/cache";
import { ApiError } from "@/lib/api";
import { attributeApi } from "../api";
import { strings } from "../strings";
import {
  updateAttributeSchema,
  zodResolver,
  type UpdateAttributeFormValues,
} from "../validationSchema";
import type { AttributeDefinition } from "../types";

export function useAttributeDefinitionForm(
  definition: AttributeDefinition | null,
  open: boolean,
  onSuccess: (() => void) | undefined,
  onOpenChange: (open: boolean) => void,
) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting: isSavingDef },
  } = useForm<UpdateAttributeFormValues>({
    resolver: zodResolver(updateAttributeSchema),
  });

  const isFilterable = watch("isFilterable");
  const currentDisplayType = watch("displayType");

  useEffect(() => {
    if (definition && open) {
      reset({
        name: definition.name,
        unit: definition.unit ?? "",
        isFilterable: definition.isFilterable,
        displayType: definition.displayType ?? "CHECKBOX",
        filterOrder: definition.filterOrder ?? 0,
      });
    }
  }, [definition, open, reset]);

  const handleSaveDefinition = async (data: UpdateAttributeFormValues) => {
    try {
      await attributeApi.updateAttributeDefinition(definition!.id, {
        name: data.name.trim(),
        unit: data.unit?.trim() || null,
        isFilterable: data.isFilterable,
        displayType: data.isFilterable ? data.displayType : undefined,
        filterOrder: data.filterOrder ?? 0,
      });
      await revalidateByTag("attributes");
      toast.success(strings.toasts.updateSuccess);
      onSuccess?.();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 404) {
          toast.error(strings.dialog.noLongerExists);
          onSuccess?.();
          onOpenChange(false);
          return;
        }
        if (
          err.details &&
          typeof err.details === "object" &&
          "code" in err.details
        ) {
          const code = (err.details as { code: string }).code;
          if (code === "ATTRIBUTE_KEY_IMMUTABLE") {
            setError("name", { message: err.message });
            return;
          }
        }
        setError("root", { message: err.message });
      } else {
        setError("root", { message: "Failed to update attribute." });
      }
    }
  };

  return {
    register,
    control,
    handleSubmit,
    errors,
    isSavingDef,
    handleSaveDefinition,
    isFilterable,
    currentDisplayType,
  };
}
