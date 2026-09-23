# Centralized API Client & Data Fetching Guidelines

All network requests from **Timmbr Console** to the **`timmbr-core`** backend service must be routed through the centralized, strongly-typed `ApiClient` singleton.

---

## 1. Golden Rule

> **Never execute raw `fetch()` calls inside UI components or route pages.**

All backend communication must go through typed domain service modules located in `lib/api/` that delegate to the centralized `ApiClient` instance (`lib/api/client.ts`).

---

## 2. Architecture & Capabilities

The `ApiClient` provides:

1. **Centralized Base URL**: Reads `NEXT_PUBLIC_API_URL` through validated runtime schema (`lib/env.ts`).
2. **Automatic Auth Injection**: Dynamically attaches `Authorization: Bearer <token>` headers via a registered `tokenGetter`.
3. **401 Unauthorized Interceptor**: Triggers token refresh or redirects to `/login` via `onUnauthorized`.
4. **Normalized Error Handling**: Non-2xx HTTP responses throw a strongly-typed `ApiError` containing `statusCode`, `message`, and optional backend validation `details`.
5. **Standardized Verbs**: Convenience methods for `api.get()`, `api.post()`, `api.put()`, `api.patch()`, and `api.delete()`.

---

## 3. Directory Structure

```text
lib/api/
├── client.ts         # ApiClient class definition, ApiError, and default singleton export
├── auth.ts           # Authentication & session refresh endpoints
├── products.ts       # Product catalog CRUD endpoints
├── orders.ts         # Orders & fulfillment endpoints
└── inventory.ts      # Stock level & warehouse endpoints
```

---

## 4. Defining a Domain API Module

Every feature domain in `timmbr-console` maintains a dedicated file under `lib/api/`.

### Example: `lib/api/products.ts`

```typescript
import { api } from "./client";
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  PaginatedResponse,
} from "@/types/product";

export const productsApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    return api.get<PaginatedResponse<Product>>("/api/v1/products", { params });
  },

  getById: async (id: string) => {
    return api.get<Product>(`/api/v1/products/${id}`);
  },

  create: async (data: CreateProductDto) => {
    return api.post<Product>("/api/v1/products", data);
  },

  update: async (id: string, data: UpdateProductDto) => {
    return api.patch<Product>(`/api/v1/products/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete<void>(`/api/v1/products/${id}`);
  },
};
```

---

## 5. Error Handling Pattern

Network errors and HTTP failure responses are converted into `ApiError`:

```typescript
import { ApiError } from "@/lib/api/client";

try {
  await productsApi.create(payload);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.statusCode === 409) {
      // Handle slug / SKU conflict
    } else if (error.statusCode === 422) {
      // Handle backend validation errors
      console.error("Validation failed:", error.details);
    }
  }
}
```

---

## 6. Form Handling & Validation (`react-hook-form` + `zod`)

Client-side administrative forms are standardized on **`react-hook-form`** with **`zod`** schema resolvers:

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, Input, Button, Card, Stack } from "@timmbr/ui";
import { strings } from "./strings";

const loginSchema = z.object({
  email: z.string().email(strings.errors.invalidEmail),
  password: z.string().min(8, strings.errors.passwordTooShort),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  onSubmit,
}: {
  onSubmit: (data: LoginFormData) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing="md">
        <FormField label={strings.fields.email} error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </FormField>
        <FormField
          label={strings.fields.password}
          error={errors.password?.message}
        >
          <Input type="password" {...register("password")} />
        </FormField>
        <Button type="submit" loading={isSubmitting}>
          {strings.buttons.submit}
        </Button>
      </Stack>
    </form>
  );
}
```
