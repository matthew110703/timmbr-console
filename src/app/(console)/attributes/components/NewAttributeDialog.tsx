"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
  Select,
  Button,
  Stack,
  Grid,
  Alert,
  Checkbox,
  toast,
} from "@timmbr/ui";
import { generateSlug } from "@/lib/utils/slug";
import { revalidateByTag } from "@/lib/cache";
import { attributeApi } from "../api";
import { strings } from "../strings";
import {
  TYPE_OPTIONS,
  SCOPE_OPTIONS,
  DISPLAY_OPTIONS,
  isFilterableType,
} from "../helpers";
import {
  createAttributeSchema,
  zodResolver,
  type CreateAttributeFormValues,
} from "../validationSchema";
import { ApiError } from "@/lib/api";

export interface NewAttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const DEFAULT_VALUES: CreateAttributeFormValues = {
  name: "",
  key: "",
  type: "STRING",
  scope: "PRODUCT",
  unit: "",
  isFilterable: false,
  displayType: "CHECKBOX",
  filterOrder: 0,
};

export const NewAttributeDialog: React.FC<NewAttributeDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAttributeFormValues>({
    resolver: zodResolver(createAttributeSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const nameValue = watch("name");
  const typeValue = watch("type");
  const isFilterable = watch("isFilterable");
  const canFilter = isFilterableType(typeValue);

  // Auto-generate key from name unless it's been manually changed
  useEffect(() => {
    const currentKey = getValues("key");
    const prevNameSlug = generateSlug(nameValue ?? "");
    if (currentKey === "" || currentKey === prevNameSlug) {
      setValue("key", generateSlug(nameValue ?? ""), { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameValue]);

  // Clear isFilterable when type changes to a non-filterable type
  useEffect(() => {
    if (!canFilter) {
      setValue("isFilterable", false, { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canFilter]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset(DEFAULT_VALUES);
    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: CreateAttributeFormValues) => {
    try {
      await attributeApi.createAttributeDefinition({
        name: data.name.trim(),
        key: data.key?.trim() || generateSlug(data.name.trim()),
        type: data.type,
        scope: data.scope,
        unit: data.unit?.trim() || null,
        isFilterable: data.isFilterable,
        displayType: data.isFilterable ? data.displayType : undefined,
        filterOrder: data.filterOrder ?? 0,
        productId: null,
      });

      await revalidateByTag("attributes");
      toast.success(strings.toasts.createSuccess);
      handleOpenChange(false);
      onSuccess?.();
    } catch (err) {
      if (err instanceof ApiError) {
        if (
          err.details &&
          typeof err.details === "object" &&
          "code" in err.details
        ) {
          const code = (err.details as { code: string }).code;
          if (code === "ATTRIBUTE_DEFINITION_ALREADY_EXISTS") {
            setError("name", { message: err.message });
            return;
          }
          if (code === "ATTRIBUTE_KEY_ALREADY_EXISTS") {
            setError("key", { message: err.message });
            return;
          }
        }
        setError("root", { message: err.message });
      } else {
        setError("root", {
          message:
            "Failed to create attribute definition. Please verify inputs.",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-sans">
            {strings.dialog.createTitle}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {strings.dialog.createSubtitle}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <DialogBody className="space-y-4">
            {errors.root && (
              <Alert
                variant="destructive"
                title={strings.dialog.createFailedTitle}
              >
                {errors.root.message}
              </Alert>
            )}

            <Stack gap={4}>
              <Grid cols={{ base: 1, sm: 2 }} gap={4}>
                <FormField
                  label={strings.dialog.nameLabel}
                  required
                  error={errors.name?.message}
                >
                  <Input
                    {...register("name")}
                    placeholder={strings.dialog.namePlaceholder}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </FormField>

                <FormField
                  label={strings.dialog.keyLabel}
                  error={errors.key?.message}
                  helperText={strings.dialog.keyHelper}
                >
                  <Input
                    {...register("key")}
                    placeholder={strings.dialog.keyPlaceholder}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setValue("key", e.target.value.toLowerCase(), {
                        shouldValidate: true,
                      })
                    }
                  />
                </FormField>
              </Grid>

              <Grid cols={{ base: 1, sm: 2 }} gap={4}>
                <FormField label={strings.dialog.typeLabel} required>
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select
                        options={TYPE_OPTIONS}
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </FormField>

                <FormField label={strings.dialog.scopeLabel} required>
                  <Controller
                    control={control}
                    name="scope"
                    render={({ field }) => (
                      <Select
                        options={SCOPE_OPTIONS}
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </FormField>
              </Grid>

              <FormField
                label={strings.dialog.unitLabel}
                helperText={strings.dialog.unitHelper}
              >
                <Input
                  {...register("unit")}
                  placeholder={strings.dialog.unitPlaceholder}
                  disabled={isSubmitting}
                />
              </FormField>

              <div className="p-3.5 rounded-lg border border-border bg-card space-y-3">
                <Controller
                  control={control}
                  name="isFilterable"
                  render={({ field }) => (
                    <Checkbox
                      id="attr-is-filterable"
                      checked={field.value}
                      onCheckedChange={(val) => field.onChange(!!val)}
                      label={strings.dialog.isFilterableLabel}
                      description={strings.dialog.isFilterableDescription}
                      disabled={isSubmitting || !canFilter}
                    />
                  )}
                />

                {isFilterable && (
                  <Grid
                    cols={{ base: 1, sm: 2 }}
                    gap={3}
                    className="pt-2 border-t border-border/80"
                  >
                    <FormField label={strings.dialog.displayTypeLabel}>
                      <Controller
                        control={control}
                        name="displayType"
                        render={({ field }) => (
                          <Select
                            options={DISPLAY_OPTIONS}
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        )}
                      />
                    </FormField>

                    <FormField label={strings.dialog.filterOrderLabel}>
                      <Input
                        {...register("filterOrder")}
                        type="number"
                        min={0}
                        max={1000}
                        disabled={isSubmitting}
                      />
                    </FormField>
                  </Grid>
                )}
              </div>
            </Stack>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {strings.dialog.cancel}
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              loadingText={strings.dialog.creating}
            >
              {strings.dialog.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
