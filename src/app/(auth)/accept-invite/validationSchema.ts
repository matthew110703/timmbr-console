import { z } from "zod";
import { strings } from "./strings";

/**
 * Password complexity regex strictly matching timmbr-core:
 * Must be at least 8 characters long and contain at least one uppercase letter,
 * one number, and one special character.
 */
export const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const acceptInviteSchema = z
  .object({
    password: z
      .string()
      .min(1, strings.validation.passwordRequired)
      .regex(passwordRegex, strings.validation.passwordFormat),
    confirmPassword: z
      .string()
      .min(1, strings.validation.confirmPasswordRequired),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: strings.validation.passwordsDoNotMatch,
    path: ["confirmPassword"],
  });

export type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>;

/**
 * Zero-dependency Zod resolver for react-hook-form.
 */
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
