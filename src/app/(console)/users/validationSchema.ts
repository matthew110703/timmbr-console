import { z } from "zod";
import { strings } from "./strings";

export const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, strings.validation.nameRequired)
    .min(3, strings.validation.nameMin)
    .max(64, strings.validation.nameMax),
  email: z
    .string()
    .min(1, strings.validation.emailRequired)
    .email(strings.validation.emailInvalid)
    .transform((val) => val.trim().toLowerCase()),
  role: z.enum(["ADMIN", "STAFF"], {
    message: strings.validation.roleRequired,
  }),
  permissions: z.array(z.string()).default([]),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, strings.validation.nameMinUpdate)
    .max(64, strings.validation.nameMax)
    .optional(),
  status: z.enum(["ACTIVE", "DELETED"]).optional(),
  role: z.enum(["ADMIN", "STAFF"]).optional(),
  permissions: z.array(z.string()).optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

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
