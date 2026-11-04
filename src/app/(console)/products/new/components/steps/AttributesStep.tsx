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
  Button,
  Inline,
} from "@timmbr/ui";
import { SlidersHorizontal } from "lucide-react";
import { attributeApi } from "@/app/(console)/attributes/api";
import type { AttributeDefinition } from "@/app/(console)/attributes/types";
import { productApi } from "../../../api";
import { strings } from "../../../strings";
import type { AttributeValuePayload } from "../../../types";

export interface AttributesStepProps {
  productId: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export const AttributesStep: React.FC<AttributesStepProps> = ({
  productId,
  onSuccess,
}) => {
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    let isMounted = true;

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

        if (!isMounted) return;

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

        if (isMounted) {
          setOptionsMap(opts);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : strings.toasts.error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleValueChange = (
    definitionId: string,
    value: AttributeValuePayload,
  ) => {
    setValues((prev) => ({ ...prev, [definitionId]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productId) return;

    setSaving(true);
    setError(null);
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
      toast.success(strings.toasts.attributesSaved);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : strings.toasts.error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card variant="subtle" className="p-8 text-center border-dashed">
        <Text variant="caption" foreground="muted">
          Loading product attributes...
        </Text>
      </Card>
    );
  }

  return (
    <form id="attributes-step-form" onSubmit={handleSubmit}>
      <Stack gap={5}>
        <div>
          <Text variant="subtitle-1" className="font-semibold text-foreground">
            Product Attributes
          </Text>
          <Text variant="caption" foreground="muted">
            Configure product-level attributes such as materials, care rules,
            and specifications.
          </Text>
        </div>

        {error && <Alert variant="destructive">{error}</Alert>}

        {definitions.length === 0 ? (
          <Card
            variant="subtle"
            className="p-6 border border-dashed rounded-xl"
          >
            <Stack gap={2} align="center" className="text-center">
              <SlidersHorizontal className="size-8 text-muted-foreground/40" />
              <Text variant="body-2" foreground="muted">
                {strings.workspace.attributes.empty}
              </Text>
              <Text variant="caption" foreground="muted">
                You can skip this step or define attributes later in the
                Attributes module.
              </Text>
            </Stack>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {definitions.map((def) => {
              const currentValue = values[def.id];
              return (
                <div
                  key={def.id}
                  className="rounded-lg border border-border bg-card p-4 space-y-2 shadow-2xs"
                >
                  <FormField
                    label={def.name}
                    helperText={def.unit ? `Unit: ${def.unit}` : undefined}
                  >
                    <AttributeValueField
                      type={def.type}
                      value={currentValue ?? null}
                      onChange={(next) =>
                        handleValueChange(def.id, next as AttributeValuePayload)
                      }
                      options={optionsMap[def.id]}
                    />
                  </FormField>
                </div>
              );
            })}
          </div>
        )}

        {/* Hidden button for programmatic submit from wizard footer */}
        <button
          type="submit"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          disabled={saving}
        />
      </Stack>
    </form>
  );
};
