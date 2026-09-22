---
name: strings-management
description: Guidelines and patterns for maintaining co-located strings.ts files across all route levels in Timmbr Console.
---

# Co-located Strings Management (`strings.ts`)

In the `Timmbr Console` architecture, all user-facing static copy, labels, headings, error messages, and descriptions must be extracted into co-located `strings.ts` files at each app/route level.

---

## Core Principle

**Zero Hardcoded Strings in Components**:
Never hardcode UI copy, button text, page titles, or descriptions directly inside `page.tsx`, `layout.tsx`, or feature components.

---

## Directory Pattern

Every route segment in `app/` must have a co-located `strings.ts` alongside its `page.tsx` or `layout.tsx`:

```text
app/
├── strings.ts                     # Root level copy (global layout, console title, metadata)
├── layout.tsx                     # Imports from ./strings
├── page.tsx
├── (auth)/
│   ├── layout.tsx
│   └── login/
│       ├── strings.ts             # /login specific copy
│       └── page.tsx               # Imports from ./strings
└── (console)/
    ├── layout.tsx                 # Imports from ./strings or root strings
    └── dashboard/
        ├── strings.ts             # /dashboard specific copy
        └── page.tsx               # Imports from ./strings
```

---

## File Structure (`strings.ts`)

Use `as const` for strict type safety and autocompletion:

```typescript
export const strings = {
  metadata: {
    title: "Dashboard | Timmbr Console",
    description: "Administrative dashboard for Timmbr commerce platform",
  },
  header: {
    title: "Dashboard",
    description: "Welcome to Timmbr Console",
  },
  actions: {
    refresh: "Refresh",
    filter: "Filter",
  },
  errors: {
    unauthorized: "You must be logged in as an administrator.",
  },
} as const;

export type AppStrings = typeof strings;
```

---

## Component Consumption

In `page.tsx` or `layout.tsx`:

```tsx
import { strings } from "./strings";

export default function Page() {
  return (
    <div>
      <h1>{strings.header.title}</h1>
      <p>{strings.header.description}</p>
    </div>
  );
}
```

---

## Benefits

1. **Separation of Concerns**: Content/copy can be revised without touching component logic or JSX structure.
2. **Localization Readiness**: Simple transition to i18n/translation frameworks when internationalization is added.
3. **Type Safety & Refactoring**: TypeScript catches missing or renamed strings at compile time.
