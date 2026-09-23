# Environment Strategy & Runtime Configuration

Timmbr Console guarantees runtime safety by validating all environment variables through strict **Zod** schemas before application startup.

---

## 1. Environment Variables Schema

All configuration options are defined and validated in `lib/env.ts`:

```typescript
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3000"),
});
```

If any mandatory variable is missing or malformed, the application will fail loudly at startup with descriptive error formatting, preventing runtime failure during execution.

---

## 2. Supported Configuration Variables

| Variable              | Scope   | Required | Default                 | Description                                                 |
| :-------------------- | :------ | :------- | :---------------------- | :---------------------------------------------------------- |
| `PORT`                | Server  | Optional | `5000`                  | Local development port assigned to the console application. |
| `NEXT_PUBLIC_API_URL` | Browser | Optional | `http://localhost:3000` | Base URL of the `timmbr-core` backend REST API service.     |

---

## 3. Configuration Files Hierarchy

1. **`.env.example`** (Committed):
   Contains the baseline defaults for local developers. Kept in source control.

   ```env
   PORT=5000
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

2. **`.env.local`** (Ignored):
   Developer-specific overrides for custom ports, staging API URLs, or local mock services. Never committed to git.

---

## 4. Client vs Server Scoping Rules

- **Browser-exposed variables** MUST be prefixed with `NEXT_PUBLIC_`. These are inlined at build time for client components.
- **Server-only variables** (e.g., private API secrets, encryption keys) MUST NOT use the `NEXT_PUBLIC_` prefix to prevent leaking credentials to the client bundle.
- Access environment variables strictly via the typed `env` export from `lib/env.ts`. Never use `process.env` directly inside business logic.
