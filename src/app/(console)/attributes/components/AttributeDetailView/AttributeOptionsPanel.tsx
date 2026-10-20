"use client";

import React from "react";
import {
  FormField,
  Input,
  Button,
  Stack,
  Grid,
  Alert,
  Badge,
  Text,
  Divider,
  Inline,
} from "@timmbr/ui";
import { Plus, Trash2, Palette } from "lucide-react";
import { generateSlug } from "@/lib/utils/slug";
import { strings } from "../../strings";
import { useAttributeOptions } from "../../hooks/useAttributeOptions";

interface AttributeOptionsPanelProps {
  definitionId: string;
  isFilterable: boolean;
  displayType: string;
  onSuccess?: () => void;
}

export const AttributeOptionsPanel: React.FC<AttributeOptionsPanelProps> = ({
  definitionId,
  isFilterable,
  displayType,
  onSuccess,
}) => {
  const {
    options,
    isLoadingOptions,
    optionError,
    newOptionLabel,
    setNewOptionLabel,
    newOptionSlug,
    setNewOptionSlug,
    newOptionSwatch,
    setNewOptionSwatch,
    isAddingOption,
    handleAddOption,
    handleDeleteOption,
  } = useAttributeOptions(definitionId, true, true, displayType, onSuccess);

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <Inline justify="between" align="center">
        <Stack gap={0.5}>
          <Text variant="body-1" className="font-semibold text-foreground">
            {strings.options.title}
          </Text>
          <Text variant="caption" className="text-muted-foreground">
            {isFilterable
              ? strings.options.helperFilterable
              : strings.options.helperNonFilterable}
          </Text>
        </Stack>
        <Badge variant="subtle" size="sm">
          {strings.options.optionsCount(options.length)}
        </Badge>
      </Inline>

      {isFilterable && options.length === 0 && !isLoadingOptions && (
        <Alert variant="warning">{strings.options.warningNoOptions}</Alert>
      )}

      {optionError && (
        <Alert variant="destructive" title={strings.options.optionsErrorTitle}>
          {optionError}
        </Alert>
      )}

      {/* Add New Option Form */}
      <form
        onSubmit={handleAddOption}
        className="p-3.5 bg-card border border-border rounded-lg space-y-3"
      >
        <Text
          variant="caption"
          className="font-semibold text-foreground uppercase tracking-wider text-[11px]"
        >
          {strings.options.addSectionTitle}
        </Text>

        <Grid cols={{ base: 1, sm: 2 }} gap={2.5}>
          <FormField label={strings.options.labelLabel} required>
            <Input
              placeholder={strings.options.labelPlaceholder}
              value={newOptionLabel}
              onChange={(e) => {
                const val = e.target.value;
                setNewOptionLabel(val);
                if (
                  newOptionSlug === "" ||
                  newOptionSlug === generateSlug(newOptionLabel)
                ) {
                  setNewOptionSlug(generateSlug(val));
                }
              }}
              disabled={isAddingOption}
            />
          </FormField>

          <FormField
            label={strings.options.slugLabel}
            helperText={strings.options.slugHelper}
          >
            <Input
              placeholder={strings.options.slugPlaceholder}
              value={newOptionSlug}
              onChange={(e) => setNewOptionSlug(e.target.value.toLowerCase())}
              disabled={isAddingOption}
            />
          </FormField>
        </Grid>

        {displayType === "SWATCH" && (
          <FormField
            label={strings.options.swatchLabel}
            helperText={strings.options.swatchHelper}
          >
            <Inline gap={2} align="center">
              <div className="flex-1">
                <Input
                  placeholder={strings.options.hexPlaceholder}
                  value={newOptionSwatch}
                  onChange={(e) => setNewOptionSwatch(e.target.value)}
                  disabled={isAddingOption}
                  leftAdornment={<Palette className="size-3.5" />}
                />
              </div>
              {newOptionSwatch && /^#[0-9a-fA-F]{6}$/.test(newOptionSwatch) && (
                <span
                  className="size-7 rounded-full border border-border shrink-0"
                  style={{ backgroundColor: newOptionSwatch }}
                  title={newOptionSwatch}
                />
              )}
            </Inline>
          </FormField>
        )}

        <Button
          type="submit"
          variant="outline"
          size="sm"
          loading={isAddingOption}
          leftIcon={<Plus className="size-3.5" />}
        >
          {strings.options.addOption}
        </Button>
      </form>

      {/* Existing Options List */}
      <div className="space-y-1.5">
        {isLoadingOptions ? (
          <div className="p-4 text-center text-body-3 text-muted-foreground">
            {strings.options.loadingOptions}
          </div>
        ) : options.length === 0 ? (
          <div className="p-4 text-center text-body-3 text-muted-foreground border border-dashed border-border rounded-lg">
            {strings.options.noOptions}
          </div>
        ) : (
          options.map((opt) => (
            <div
              key={opt.id}
              className="flex items-center justify-between px-3 py-2 bg-card hover:bg-muted/40 transition-colors border border-border rounded-md text-sm"
            >
              <Inline gap={2} align="center">
                {opt.swatchHex && (
                  <span
                    className="size-4 rounded-full border border-border shrink-0"
                    style={{ backgroundColor: opt.swatchHex }}
                  />
                )}
                <span className="font-medium text-foreground">{opt.label}</span>
                <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {opt.slug}
                </span>
              </Inline>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => handleDeleteOption(opt.id)}
                aria-label={`Delete option ${opt.label}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      <Divider />
    </div>
  );
};
