"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  Stack,
  FormField,
  Text,
  Alert,
  AttributeValueField,
  toast,
} from "@timmbr/ui";
import { attributeApi } from "../../attributes/api";
import type { AttributeDefinition } from "../../attributes/types";
import { productApi } from "../api";
import { strings } from "../strings";
import { useProductWorkspace } from "./ProductWorkspaceContext";
import type { AttributeValuePayload } from "../types";

export const AttributesTab: React.FC = () => {
  const { productId, setTabDirty, registerSaveHandler } = useProductWorkspace();

  const [definitions, setDefinitions] = useState<AttributeDefinition[]>([]);
  const [values, setValues] = useState<Record<string, AttributeValuePayload>>(
    {},
  );
  const [initialValues, setInitialValues] = useState<
    Record<string, AttributeValuePayload>
  >({});
  const [optionsMap, setOptionsMap] = useState<
    Record<string, { label: string; slug: string; swatchHex?: string | null }[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [defsRes, assigned] = await Promise.all([
          attributeApi.getAttributeDefinitions({
            limit: 100,
            scope: "PRODUCT",
          }),
          productApi.getProductAttributes(productId),
        ]);

        const productDefs = defsRes.data.filter(
          (d) => d.scope === "PRODUCT" && !d.productId,
        );

        setDefinitions(productDefs);

        const map: Record<string, AttributeValuePayload> = {};
        for (const a of assigned) {
          map[a.definition.id] = a.value;
        }
        setValues(map);
        setInitialValues(map);

        const opts: typeof optionsMap = {};
        await Promise.all(
          productDefs
            .filter((d) => d.type === "LIST" || d.type === "STRING")
            .map(async (d) => {
              try {
                const options = await attributeApi.getOptions(d.id);
                opts[d.id] = options.map((o) => ({
                  label: o.label,
                  slug: o.slug,
                  swatchHex: o.swatchHex,
                }));
              } catch {
                opts[d.id] = [];
              }
            }),
        );
        setOptionsMap(opts);
      } catch (err) {
        setError(err instanceof Error ? err.message : strings.toasts.error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [productId]);

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  useEffect(() => {
    setTabDirty("attributes", isDirty);
  }, [isDirty, setTabDirty]);

  const saveAttributes = useCallback(async (): Promise<boolean> => {
    if (!productId) return false;
    try {
      for (const def of definitions) {
        const nextVal = values[def.id];
        const prevVal = initialValues[def.id];
        const hasNext =
          nextVal !== undefined &&
          nextVal !== "" &&
          !(Array.isArray(nextVal) && nextVal.length === 0);
        const hadPrev = prevVal !== undefined;

        if (hasNext && JSON.stringify(nextVal) !== JSON.stringify(prevVal)) {
          if (hadPrev) {
            await productApi.removeProductAttribute(productId, def.id);
          }
          await productApi.assignProductAttribute(productId, {
            definitionId: def.id,
            value: nextVal,
          });
        } else if (!hasNext && hadPrev) {
          await productApi.removeProductAttribute(productId, def.id);
        }
      }
      setInitialValues(values);
      setTabDirty("attributes", false);
      toast.success(strings.toasts.attributesSaved);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : strings.toasts.error);
      return false;
    }
  }, [definitions, initialValues, productId, setTabDirty, values]);

  useEffect(() => {
    registerSaveHandler("attributes", saveAttributes);
  }, [registerSaveHandler, saveAttributes]);

  if (!productId) {
    return null;
  }

  return (
    <Card variant="subtle" className="p-5">
      <Stack gap={5}>
        <div>
          <Text variant="subtitle-1" className="font-semibold text-foreground">
            Product Attributes
          </Text>
          <Text variant="caption" foreground="muted">
            Configure global product-level specifications (materials, warranty,
            care instructions).
          </Text>
        </div>

        {error ? <Alert variant="destructive" title={error} /> : null}

        {loading ? (
          <Card variant="subtle" className="p-8 text-center border-dashed">
            <Text variant="caption" foreground="muted">
              Loading product attributes...
            </Text>
          </Card>
        ) : definitions.length === 0 ? (
          <Card variant="subtle" className="p-8 text-center border-dashed">
            <Text variant="caption" foreground="muted">
              {strings.workspace.attributes.empty}
            </Text>
          </Card>
        ) : (
          <Stack gap={4}>
            {definitions.map((def) => (
              <FormField key={def.id} label={def.name}>
                <AttributeValueField
                  type={def.type}
                  value={values[def.id]}
                  onChange={(v) =>
                    setValues((prev) => ({
                      ...prev,
                      [def.id]: v as AttributeValuePayload,
                    }))
                  }
                  options={optionsMap[def.id]}
                  unit={def.unit}
                  size="sm"
                />
              </FormField>
            ))}
          </Stack>
        )}

        <Text variant="caption" foreground="muted">
          {strings.workspace.attributes.saveHint}
        </Text>
      </Stack>
    </Card>
  );
};
