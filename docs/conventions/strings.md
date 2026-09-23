# Static Strings Convention (`strings.ts`)

To ensure maintainability, content clarity, and future localization readiness, **Timmbr Console** enforces co-located `strings.ts` files across all application route segments.

---

## 1. Golden Rule

> **Never hardcode static user-facing strings directly in components, pages, or JSX.**

All static text constants—including page titles, meta descriptions, button labels, table headers, empty states, and field validation error messages—must reside in a co-located `strings.ts` file at the corresponding route segment.

---

## 2. Co-location Convention

```text
app/
├── strings.ts                 # Global root copy (metadata, brand titles, global fallbacks)
├── layout.tsx
├── (auth)/
│   └── login/
│       ├── strings.ts         # Copy specific to /login
│       └── page.tsx
└── (console)/
    ├── layout.tsx             # Administrative shell (sidebar & topbar copy)
    ├── dashboard/
    │   ├── strings.ts         # Copy specific to /dashboard
    │   └── page.tsx
    ├── products/
    │   ├── strings.ts         # Copy specific to /products
    │   └── page.tsx
    └── orders/
        ├── strings.ts         # Copy specific to /orders
        └── page.tsx
```

---

## 3. Standard Implementation Pattern

### 1. Define `strings.ts`

```typescript
export const strings = {
  metadata: {
    title: "Products Catalog | Timmbr Console",
    description: "Manage catalog products, variants, and pricing.",
  },
  header: {
    title: "Products",
    subtitle: "Manage and configure items across your digital storefront.",
    createButton: "New Product",
  },
  table: {
    columnName: "Product",
    columnSku: "SKU",
    columnPrice: "Price",
    columnStatus: "Status",
    columnInventory: "In Stock",
    emptyTitle: "No products found",
    emptyDescription: "Get started by creating your first product.",
  },
  status: {
    active: "Active",
    draft: "Draft",
    archived: "Archived",
  },
} as const;

export type ProductsStrings = typeof strings;
```

### 2. Consume in `page.tsx` or Client Component

```tsx
import { strings } from "./strings";

export const metadata = {
  title: strings.metadata.title,
  description: strings.metadata.description,
};

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {strings.header.title}
          </h1>
          <p className="text-sm text-neutral-500">{strings.header.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. Key Benefits

- **Clear Separation of Concerns**: Logic stays strictly separated from presentation text.
- **Copy Audits**: Product managers and UX copywriters can inspect and refine all application copy in isolated files without touching UI logic.
- **Internationalization (i18n) Readiness**: When multilingual support is introduced, extracting `strings.ts` into dictionary catalogs requires zero component rewrites.
