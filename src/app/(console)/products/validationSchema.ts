import { z } from "zod";

const hsnRegex = /^(?!0+$)(\d{4}|\d{6}|\d{8})$/;

export const productInfoSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title cannot exceed 100 characters"),
  shortDescription: z
    .string()
    .min(2, "Short description must be at least 2 characters")
    .max(250, "Short description cannot exceed 250 characters"),
  categoryId: z.string().uuid("Select a valid category"),
  brandId: z.string().uuid().optional().or(z.literal("")),
  hsnCode: z
    .string()
    .optional()
    .refine((val) => !val || hsnRegex.test(val), {
      message: "HSN code must be 4, 6, or 8 digits",
    }),
  gstRate: z.coerce
    .number()
    .min(0, "GST rate cannot be less than 0")
    .max(100, "GST rate cannot exceed 100")
    .optional()
    .default(18),
  fullDescription: z.string().optional(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).optional(),
});

export type ProductInfoFormValues = z.infer<typeof productInfoSchema>;

export const variantFormSchema = z.object({
  sku: z
    .string()
    .min(2, "SKU must be at least 2 characters")
    .max(100, "SKU cannot exceed 100 characters"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  compareAtPrice: z.coerce
    .number()
    .min(0, "Compare at price cannot be negative")
    .optional()
    .nullable(),
  currency: z.string().min(3).max(3).default("INR"),
  status: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED"]).default("ACTIVE"),
  isDefault: z.boolean().optional(),
});

export type VariantFormValues = z.infer<typeof variantFormSchema>;

export const basicInfoSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title cannot exceed 100 characters"),
  shortDescription: z
    .string()
    .min(2, "Short description must be at least 2 characters")
    .max(250, "Short description cannot exceed 250 characters"),
  categoryId: z.string().uuid("Select a valid category"),
  brandId: z.string().uuid().optional().or(z.literal("")),
  hsnCode: z
    .string()
    .optional()
    .refine((val) => !val || hsnRegex.test(val), {
      message: "HSN code must be 4, 6, or 8 digits",
    }),
  gstRate: z.coerce
    .number()
    .min(0, "GST rate cannot be less than 0")
    .max(100, "GST rate cannot exceed 100")
    .optional()
    .default(18),
  description: z.string().optional(),
});

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

export function zodResolver<T extends z.ZodTypeAny>(schema: T) {
  return async (data: unknown) => {
    const result = schema.safeParse(data);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join(".") || "root";
      if (!errors[field]) {
        errors[field] = { type: issue.code, message: issue.message };
      }
    }
    return { values: {}, errors };
  };
}
