"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input, Button, Alert, Stack } from "@timmbr/ui";
import { LogIn } from "lucide-react";
import { FadeView } from "@timmbr/motion";
import { authApi } from "@/app/(auth)/api";
import { ApiError } from "@/lib/api";
import { strings } from "./strings";
import {
  loginSchema,
  zodResolver,
  type LoginFormValues,
} from "./validationSchema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isErrorDismissed, setIsErrorDismissed] = React.useState(false);

  const isUnauthorized = searchParams.get("error") === "unauthorized";
  const authError =
    formError ??
    (!isErrorDismissed && isUnauthorized
      ? strings.errors.unauthorizedAccess
      : null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    setIsErrorDismissed(true);
    try {
      await authApi.login(values);
      const fromParam = searchParams.get("from");
      const targetDestination =
        fromParam &&
        fromParam.startsWith("/") &&
        !fromParam.startsWith("/login")
          ? fromParam
          : "/overview";
      router.replace(targetDestination);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError(strings.errors.genericError);
      }
    }
  };

  return (
    <FadeView>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap={4}>
          {authError && (
            <Alert
              variant="destructive"
              title={authError}
              dismissible
              onClose={() => {
                setFormError(null);
                setIsErrorDismissed(true);
              }}
            />
          )}

          <Input
            id="email"
            type="email"
            label={strings.form.emailLabel}
            placeholder={strings.form.emailPlaceholder}
            error={errors.email?.message}
            disabled={isSubmitting}
            autoComplete="email"
            {...register("email")}
          />

          <Input
            id="password"
            type="password"
            label={strings.form.passwordLabel}
            placeholder={strings.form.passwordPlaceholder}
            error={errors.password?.message}
            disabled={isSubmitting}
            autoComplete="current-password"
            showPasswordToggle
            {...register("password")}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            loading={isSubmitting}
            loadingText={strings.form.submittingButton}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            {strings.form.submitButton}
          </Button>
        </Stack>
      </form>
    </FadeView>
  );
}
