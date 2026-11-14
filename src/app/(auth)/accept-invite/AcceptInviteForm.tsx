"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input, Button, Alert, Stack, Center, Spinner, Text } from "@timmbr/ui";
import { KeyRound } from "lucide-react";
import { FadeView } from "@timmbr/motion";
import { authApi } from "@/app/(auth)/api";
import { ApiError } from "@/lib/api";
import { strings } from "./strings";
import {
  acceptInviteSchema,
  zodResolver,
  type AcceptInviteFormValues,
} from "./validationSchema";

export function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [validationState, setValidationState] = React.useState<
    "validating" | "valid" | "invalid"
  >(() => (token ? "validating" : "invalid"));
  const [validationError, setValidationError] = React.useState<string | null>(
    () => (token ? null : strings.errors.missingToken),
  );
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) return;

    let isCancelled = false;

    async function checkToken() {
      try {
        await authApi.validateInviteToken(token as string);
        if (!isCancelled) {
          setValidationState("valid");
        }
      } catch (err) {
        if (!isCancelled) {
          setValidationState("invalid");
          const message =
            err instanceof ApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : strings.errors.invalidOrExpiredToken;
          setValidationError(message);
        }
      }
    }

    void checkToken();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: AcceptInviteFormValues) => {
    if (!token) return;
    setFormError(null);
    try {
      await authApi.acceptInvite(token, values.password);
      router.replace("/login?invited=1");
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

  if (validationState === "validating") {
    return (
      <Center className="py-12">
        <Spinner size="lg" label={strings.validating.loading} />
      </Center>
    );
  }

  if (validationState === "invalid") {
    return (
      <FadeView>
        <Stack gap={4}>
          <Alert variant="destructive" title={strings.errors.expiredTitle}>
            <Text
              variant="caption"
              className="text-destructive-foreground mt-1"
            >
              {validationError || strings.errors.invalidOrExpiredToken}
            </Text>
          </Alert>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/login">{strings.buttons.backToLogin}</Link>
          </Button>
        </Stack>
      </FadeView>
    );
  }

  return (
    <FadeView>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap={4}>
          {formError && (
            <Alert
              variant="destructive"
              title={formError}
              dismissible
              onClose={() => setFormError(null)}
            />
          )}

          <Input
            id="password"
            type="password"
            label={strings.form.passwordLabel}
            placeholder={strings.form.passwordPlaceholder}
            error={errors.password?.message}
            disabled={isSubmitting}
            autoComplete="new-password"
            showPasswordToggle
            {...register("password")}
          />

          <Input
            id="confirmPassword"
            type="password"
            label={strings.form.confirmPasswordLabel}
            placeholder={strings.form.confirmPasswordPlaceholder}
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
            autoComplete="new-password"
            showPasswordToggle
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            loading={isSubmitting}
            loadingText={strings.form.submittingButton}
            leftIcon={<KeyRound className="w-4 h-4" />}
          >
            {strings.form.submitButton}
          </Button>
        </Stack>
      </form>
    </FadeView>
  );
}
