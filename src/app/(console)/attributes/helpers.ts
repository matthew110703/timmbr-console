import type { AttributeScope, AttributeType, FilterDisplay } from "./types";

export const TYPE_OPTIONS: { value: AttributeType; label: string }[] = [
  { value: "STRING", label: "String (Text)" },
  { value: "LIST", label: "List (Multiple Choice)" },
  { value: "INTEGER", label: "Integer (Whole Number)" },
  { value: "DECIMAL", label: "Decimal (Numeric Precision)" },
  { value: "BOOLEAN", label: "Boolean (Yes/No)" },
];

export const SCOPE_OPTIONS: { value: AttributeScope; label: string }[] = [
  { value: "PRODUCT", label: "Product (Global / Item Level)" },
  { value: "VARIANT", label: "Variant (SKU / Option Level)" },
];

export const DISPLAY_OPTIONS: { value: FilterDisplay; label: string }[] = [
  { value: "CHECKBOX", label: "Checkbox List" },
  { value: "SWATCH", label: "Visual Color / Pattern Swatch" },
  { value: "TOGGLE", label: "Button Toggle Group" },
];

export type BadgeVariant = "default" | "subtle" | "outline";

export interface TypeBadgeConfig {
  variant: BadgeVariant;
  className?: string;
}

export function getBadgeConfigForType(type: AttributeType): TypeBadgeConfig {
  const map: Record<AttributeType, TypeBadgeConfig> = {
    LIST: {
      variant: "default",
      className: "bg-primary text-primary-foreground font-medium",
    },
    STRING: {
      variant: "outline",
      className: "border-border font-medium text-foreground",
    },
    INTEGER: { variant: "subtle", className: "bg-muted font-medium" },
    DECIMAL: { variant: "subtle", className: "bg-muted font-medium" },
    BOOLEAN: { variant: "outline", className: "border-border font-medium" },
  };
  return map[type] ?? { variant: "subtle" };
}

export function getScopeBadgeConfig(scope: AttributeScope): {
  variant: BadgeVariant;
  className?: string;
} {
  return scope === "PRODUCT"
    ? {
        variant: "subtle",
        className: "bg-accent/40 text-foreground border-border",
      }
    : {
        variant: "outline",
        className: "text-muted-foreground border-border/60",
      };
}

/** Types that support discrete option lists. */
export function supportsOptions(type: AttributeType): boolean {
  return type === "LIST" || type === "STRING";
}

/** Types that can be marked as storefront filters (mirrors backend FILTERABLE_TYPES). */
const FILTERABLE_TYPES = new Set<AttributeType>(["STRING", "LIST", "BOOLEAN"]);

export function isFilterableType(type: AttributeType): boolean {
  return FILTERABLE_TYPES.has(type);
}
