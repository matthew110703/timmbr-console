# Design System Architecture & Consumption Guidelines

**Timmbr Console** strictly standardizes its entire user interface on the **Timmbr Design System** (`timmbr-ds`). All visual styling, design tokens, interactive controls, layout primitives, and animations are provided by centralized packages.

---

## 1. Core Design System Packages

| Package              | Version       | Description                                                                                     |
| :------------------- | :------------ | :---------------------------------------------------------------------------------------------- |
| **`@timmbr/ui`**     | `^1.0.0-beta` | Core React component library (Layout, Display, Forms, Overlays, Feedback, Data).                |
| **`@timmbr/theme`**  | `^1.0.0-beta` | Design tokens, CSS variables, and Tailwind CSS v4 `@theme` definitions (`theme.css`).           |
| **`@timmbr/motion`** | `^1.0.0-beta` | Physics-based transitions, variants, presence, and motion primitives powered by `motion/react`. |
| **`@timmbr/icons`**  | `^1.0.0-beta` | Unified iconography system.                                                                     |
| **`@timmbr/hooks`**  | `^1.0.0-beta` | Pure React hooks for UI states, disclosures, and responsive breakpoints.                        |
| **`@timmbr/utils`**  | `^1.0.0-beta` | Shared styling utilities, class merging (`cn`), and helper functions.                           |

Living Storybook reference: [https://timmbr-ds-storybook.vercel.app](https://timmbr-ds-storybook.vercel.app/?path=/story/overview-home--overview)

---

## 2. Fundamental Consumption Rules

### Rule 1: No Ad-Hoc Styled Elements

- All UI elements in `timmbr-console` must be imported from `@timmbr/ui`.
- Never write ad-hoc styled HTML tags (`<button className="...">`, `<input className="...">`, `<div className="card">`) when a design system primitive exists.
- Supported primitives include:
  - **Layout**: `Container`, `Grid`, `Center`, `Stack`, `Inline`
  - **Form**: `Input`, `Textarea`, `Select`, `Radio`, `Checkbox`, `Switch`, `RangeSlider`, `Label`, `FormField`
  - **Display**: `Button`, `Badge`, `Card`, `Avatar`, `Divider`, `Heading`, `Text`, `Chip`, `Stat`
  - **Feedback**: `Alert`, `Progress`, `Spinner`, `Skeleton`, `EmptyState`
  - **Overlays**: `Dialog`, `Drawer`, `Dropdown`, `Popover`, `Toast`, `Tooltip`, `Tabs`
  - **Data**: `Table`, `Pagination`, `DataList`, `List`

### Rule 2: Missing Component Escalation Protocol

- If a required UI component is not available in `@timmbr/ui`, **never build an unapproved local substitute**.
- Immediately notify the team, describe the requirement, and evaluate whether it should be:
  1. Contributed upstream to `@timmbr/ds`, or
  2. Composed cleanly from existing primitives with explicit design approval.

### Rule 3: Strict Consent for Visual & Token Deviations

- Colors, typography scales, elevation shadows, radius tokens, and spacing scales must strictly adhere to `@timmbr/theme`.
- Any visual styling outside token definitions requires explicit user consent.

### Rule 4: Co-located Strings Integration

- Static text rendered inside components (e.g., button labels, placeholder text, field error messages) must always be sourced from the route's co-located `strings.ts`.

---

## 3. Configuration & Next.js App Router Integration

### Provider Layering

In `app/layout.tsx`, wrap the application with `<TimmbrConfigProvider>`:

```tsx
import { TimmbrConfigProvider } from "@timmbr/ui";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <TimmbrConfigProvider config={{ theme: { mode: "light" } }}>
          {children}
        </TimmbrConfigProvider>
      </body>
    </html>
  );
}
```

### Tailwind CSS v4 Configuration (`app/globals.css`)

Tailwind CSS v4 imports the centralized theme stylesheet and specifies `@source` paths for component scanning:

```css
@import "tailwindcss";
@import "@timmbr/theme/theme.css";

@source "./node_modules/@timmbr/ui/dist";
@source "./node_modules/@timmbr/icons/dist";
@source "./app/**/*.{js,ts,jsx,tsx}";
@source "./components/**/*.{js,ts,jsx,tsx}";
```

### Transpilation Configuration (`next.config.ts`)

Ensure ESM packages are properly transpiled by SWC:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@timmbr/ui",
    "@timmbr/theme",
    "@timmbr/icons",
    "@timmbr/motion",
    "@timmbr/hooks",
    "@timmbr/utils",
  ],
};

export default nextConfig;
```

---

## 4. Local Development Linking Strategy (`../timmbr-ds`)

When developing design system components concurrently in `../timmbr-ds`, the application uses **`yalc`** for package linking.

### Why Yalc Instead of `pnpm link`?

Raw symlinks (`pnpm link`) point to absolute paths outside the `timmbr-console` directory, causing Next.js Turbopack to fail with `leaves the filesystem root` boundary errors.

`yalc` publishes package builds into a local store and injects isolated `.yalc/` copies into `timmbr-console`, preserving 100% compatibility with **Turbopack**, **SWC**, and **Fast Refresh**.

### Management Commands in `timmbr-console`

| Command          | Description                                                                                       |
| :--------------- | :------------------------------------------------------------------------------------------------ |
| `pnpm ds:status` | Inspect all `@timmbr/*` dependencies and show if they are **Registry (npm)** or **Yalc Link**     |
| `pnpm ds:link`   | Builds and publishes local packages from `../timmbr-ds` into Yalc and links into `timmbr-console` |
| `pnpm ds:unlink` | Unlinks all Yalc packages, removes `.yalc/`, and restores clean NPM registry packages             |

### Making Subsequent Edits in `timmbr-ds`

Once linked via `pnpm ds:link`, you do not need to re-run link commands in `timmbr-console`. When making changes in `timmbr-ds`:

```bash
# In timmbr-ds/
pnpm yalc:push          # Rebuilds and pushes all packages to active apps
pnpm yalc:push ui       # Rebuilds and pushes @timmbr/ui only
pnpm yalc:push theme    # Rebuilds and pushes @timmbr/theme only
```

Turbopack will detect the updated files in `.yalc/` immediately and trigger Fast Refresh in your browser.
