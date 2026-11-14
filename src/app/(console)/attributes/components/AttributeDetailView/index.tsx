"use client";

import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  Alert,
  Badge,
  Text,
  Button,
  Inline,
} from "@timmbr/ui";
import { Sliders } from "lucide-react";
import { strings } from "../../strings";
import { supportsOptions, isFilterableType } from "../../helpers";
import { useAttributeDefinitionForm } from "../../hooks/useAttributeDefinitionForm";
import { AttributeDefinitionForm } from "./AttributeDefinitionForm";
import { AttributeOptionsPanel } from "./AttributeOptionsPanel";
import type { AttributeDefinition } from "../../types";

export interface AttributeDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  definition: AttributeDefinition | null;
  onSuccess?: () => void;
  readOnly?: boolean;
}

export const AttributeDetailView: React.FC<AttributeDetailViewProps> = ({
  open,
  onOpenChange,
  definition,
  onSuccess,
  readOnly = false,
}) => {
  const {
    register,
    control,
    handleSubmit,
    errors,
    isSavingDef,
    handleSaveDefinition,
    isFilterable,
    currentDisplayType,
  } = useAttributeDefinitionForm(definition, open, onSuccess, onOpenChange);

  if (!definition) return null;

  const hasOptions = supportsOptions(definition.type);
  const canFilter = isFilterableType(definition.type);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="default" className="w-full sm:max-w-xl">
        <DrawerHeader>
          <Inline gap={2} align="center">
            <Sliders className="size-5 text-primary" />
            <DrawerTitle>{strings.dialog.editTitle}</DrawerTitle>
          </Inline>
          <DrawerDescription>{strings.dialog.editSubtitle}</DrawerDescription>
        </DrawerHeader>

        <DrawerBody className="space-y-6 overflow-y-auto">
          {errors.root && (
            <Alert
              variant="destructive"
              title={strings.dialog.updateFailedTitle}
            >
              {errors.root.message}
            </Alert>
          )}

          {/* Read-only metadata badges */}
          <Inline
            gap={2}
            align="center"
            wrap
            className="p-3 bg-muted/40 rounded-lg border border-border"
          >
            <Text variant="body-3" className="text-muted-foreground">
              {strings.definitionMeta.typeLabel}:
            </Text>
            <Badge variant="subtle">{definition.type}</Badge>
            <Text variant="body-3" className="text-muted-foreground ml-2">
              {strings.definitionMeta.scopeLabel}:
            </Text>
            <Badge variant="outline">{definition.scope}</Badge>
            {definition.key && (
              <>
                <Text variant="body-3" className="text-muted-foreground ml-2">
                  {strings.definitionMeta.keyLabel}:
                </Text>
                <code className="font-mono text-xs text-foreground bg-card px-2 py-0.5 rounded border border-border">
                  {definition.key}
                </code>
              </>
            )}
          </Inline>

          <AttributeDefinitionForm
            register={register}
            control={control}
            errors={errors}
            isSavingDef={isSavingDef}
            isFilterable={isFilterable}
            canFilter={canFilter}
            onSubmit={handleSubmit(handleSaveDefinition)}
            readOnly={readOnly}
          />

          {hasOptions && (
            <AttributeOptionsPanel
              definitionId={definition.id}
              isFilterable={isFilterable}
              displayType={currentDisplayType ?? "CHECKBOX"}
              onSuccess={onSuccess}
              readOnly={readOnly}
            />
          )}
        </DrawerBody>

        <DrawerFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {strings.dialog.cancel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
