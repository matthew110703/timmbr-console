import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  slug: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val),
      "Slug must contain only lowercase alphanumeric characters and hyphens",
    ),
  description: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length >= 10 && val.length <= 200),
      "Description must be between 10 and 200 characters if provided",
    ),
  parentId: z.string().nullable().optional(),
  logoUrl: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;
