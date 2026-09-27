import { Suspense } from "react";
import Image from "next/image";
import { Card, Text, Stack, Center, Spinner } from "@timmbr/ui";
import { strings } from "./strings";
import { LoginForm } from "./LoginForm";
import { ASSETS } from "@/../public";

export const metadata = {
  title: strings.metadata.title,
  description: strings.metadata.description,
};

export default function LoginPage() {
  return (
    <Card
      variant="elevated"
      padding="none"
      className="border-none shadow-2xl rounded-2xl bg-white p-8 sm:p-10 w-full max-w-[420px] mx-auto space-y-3"
    >
      {/* Branding Logo & Subtitle */}
      <Stack align="center" gap={3} className="text-center mb-8">
        <Center className="relative mb-2">
          <Image
            src={ASSETS.logo}
            alt={strings.branding.logoAlt}
            width={160}
            height={40}
            priority
            className="h-10 w-auto object-contain"
          />
        </Center>
        <Text
          variant="body-2"
          foreground="muted"
          className="max-w-xs leading-relaxed text-center"
        >
          {strings.subtitle}
        </Text>
      </Stack>

      {/* 2-Input Login Form */}
      <Suspense
        fallback={
          <Center className="py-12">
            <Spinner size="lg" label="Loading..." />
          </Center>
        }
      >
        <LoginForm />
      </Suspense>
    </Card>
  );
}
