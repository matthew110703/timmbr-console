import { z } from "zod";
import { isFilterableType } from "./helpers";

const ATTRIBUTE_KEY_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

export const createAttributeSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),
    key: z
      .string()
      .regex(
        ATTRIBUTE_KEY_REGEX,
        "Key must be lowercase letters, digits and single hyphens",
      )
      .max(100, "Key cannot exceed 100 characters")
      .optional()
      .or(z.literal("")),
    type: z.enum(["STRING", "INTEGER", "DECIMAL", "LIST", "BOOLEAN"]),
    scope: z.enum(["PRODUCT", "VARIANT"]),
    unit: z.string().max(50, "Unit cannot exceed 50 characters").optional(),
    isFilterable: z.boolean().default(false),
    displayType: z.enum(["CHECKBOX", "SWATCH", "TOGGLE"]).default("CHECKBOX"),
    filterOrder: z.coerce.number().int().min(0).max(1000).default(0),
  })
  .refine((data) => !data.isFilterable || isFilterableType(data.type), {
    message:
      "INTEGER and DECIMAL attributes cannot be used as storefront filters.",
    path: ["isFilterable"],
  });

export const updateAttributeSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  unit: z
    .string()
    .max(50, "Unit cannot exceed 50 characters")
    .nullable()
    .optional(),
  isFilterable: z.boolean(),
  displayType: z.enum(["CHECKBOX", "SWATCH", "TOGGLE"]),
  filterOrder: z.coerce.number().int().min(0).max(1000),
});

export const addOptionSchema = z.object({
  label: z
    .string()
    .min(1, "Label is required")
    .max(100, "Label cannot exceed 100 characters"),
  slug: z.string().optional(),
  swatchHex: z
    .string()
    .regex(HEX_REGEX, "Must be a valid hex colour (e.g. #5C3A21)")
    .optional()
    .nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type CreateAttributeFormValues = z.infer<typeof createAttributeSchema>;
export type UpdateAttributeFormValues = z.infer<typeof updateAttributeSchema>;
export type AddOptionFormValues = z.infer<typeof addOptionSchema>;

/** Zero-dependency Zod resolver for react-hook-form (matches login/validationSchema pattern). */
export function zodResolver<T extends z.ZodTypeAny>(schema: T) {
  return async (data: unknown) => {
    const result = schema.safeParse(data);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0]?.toString() || "root";
      if (!errors[field]) {
        errors[field] = { type: issue.code, message: issue.message };
      }
    }
    return { values: {}, errors };
  };
}
