"use client";

import React from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { FormField, Input, Select, Button, Grid, Checkbox } from "@timmbr/ui";
import { strings } from "../../strings";
import { DISPLAY_OPTIONS } from "../../helpers";
import type { UpdateAttributeFormValues } from "../../validationSchema";

interface AttributeDefinitionFormProps {
  register: UseFormRegister<UpdateAttributeFormValues>;
  control: Control<UpdateAttributeFormValues>;
  errors: FieldErrors<UpdateAttributeFormValues>;
  isSavingDef: boolean;
  isFilterable: boolean;
  canFilter: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export const AttributeDefinitionForm: React.FC<
  AttributeDefinitionFormProps
> = ({
  register,
  control,
  errors,
  isSavingDef,
  isFilterable,
  canFilter,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField
        label={strings.dialog.nameLabel}
        required
        error={errors.name?.message}
      >
        <Input {...register("name")} disabled={isSavingDef} />
      </FormField>

      <FormField
        label={strings.dialog.unitLabel}
        helperText={strings.dialog.unitHelper}
      >
        <Input
          {...register("unit")}
          placeholder={strings.dialog.unitPlaceholder}
          disabled={isSavingDef}
        />
      </FormField>

      <div className="p-3.5 rounded-lg border border-border bg-card space-y-3">
        <Controller
          control={control}
          name="isFilterable"
          render={({ field }) => (
            <Checkbox
              id="edit-is-filterable"
              checked={field.value}
              onCheckedChange={(val) => field.onChange(!!val)}
              label={strings.dialog.isFilterableLabel}
              description={strings.dialog.isFilterableDescription}
              disabled={isSavingDef || !canFilter}
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
                    disabled={isSavingDef}
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
                disabled={isSavingDef}
              />
            </FormField>
          </Grid>
        )}
      </div>

      <Button
        type="submit"
        variant="default"
        size="sm"
        loading={isSavingDef}
        loadingText={strings.dialog.saving}
      >
        {strings.dialog.save}
      </Button>
    </form>
  );
};
