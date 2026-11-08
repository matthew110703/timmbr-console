import { z } from "zod";

const orderStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
]);

export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
  notes: z.string().max(500).optional().or(z.literal("")),
  verificationCode: z.string().max(64).optional().or(z.literal("")),
});

export type UpdateOrderStatusFormValues = z.infer<
  typeof updateOrderStatusSchema
>;

const manufacturingEventEnum = z.enum([
  "MATERIAL_PREPARATION",
  "MANUFACTURING_STARTED",
  "MANUFACTURING_UPDATE",
  "QUALITY_CHECK_COMPLETED",
  "READY_FOR_DISPATCH",
  "DELIVERY_COORDINATION",
]);

export const logOrderActivitySchema = z.object({
  eventType: manufacturingEventEnum,
  description: z.string().max(1000).optional().or(z.literal("")),
});

export type LogOrderActivityFormValues = z.infer<typeof logOrderActivitySchema>;

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
