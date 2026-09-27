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

### Rule 1: Component-First Hierarchy (Inspect Design System First)

- **First Priority**: Before writing ANY UI markup, always inspect `@timmbr/ui` to verify if an existing primitive matches the requirement.
- Never write ad-hoc styled HTML tags (`<button className="...">`, `<input className="...">`, `<div className="card">`, `<h1>`, `<p>`) when a design system primitive exists.
- Native HTML elements are ONLY permitted for semantic wrappers (such as `<form>`, `<main>`, `<nav>`) or when no suitable primitive exists. Any other use must be justified or escalated under Rule 2.
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

### Rule 5: Subcomponents Architecture for Complex Components

- When contributing or consuming complex components (such as `SideBarNavigation`), internal interactive primitives and modular elements are organized under a `subcomponents/` directory (e.g., `SidebarBranding`, `SidebarToggle`, `SidebarNavItem`, `SidebarPopoverMenu`, `SidebarFooter`).
- State logic, route-matching algorithms, and persistence helpers reside in a co-located `ComponentName.helpers.ts` or static content file.
- All subcomponents and types remain cleanly accessible through the primary component barrel export.

### Rule 6: Motion Animations First, Vanilla CSS Fallback

- **Centralization in `@timmbr/motion`**: All motion animations, spring physics, transition tokens, and animation variants must stay strictly inside `@timmbr/motion`. All other packages (`@timmbr/ui`, apps) must ONLY consume from `@timmbr/motion`. Never write ad-hoc motion physics or variants inside components.
- **Motion First**: Every interactive component must prioritize physics-based **motion animations** powered by `@timmbr/motion` (`motion/react`, `AnimatePresence`, spring transitions, layout animations).
- Components must implement the `motion?: MotionProp` interface and subscribe to `useGlobalAnimation()`.
- **Vanilla CSS Fallback**: When motion is disabled (`motion={false}`, `disableAnimations={true}`, reduced-motion preferences, or non-motion contexts), components must cleanly fall back to vanilla CSS transitions and standard keyframes with zero layout breaking or visual glitches.

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

### Tailwind CSS v4 Configuration (`src/app/globals.css`)

Tailwind CSS v4 imports the centralized theme stylesheet and specifies `@source` paths for component scanning:

```css
@import "tailwindcss";
@import "@timmbr/theme/theme.css";

@source "../../node_modules/@timmbr/ui/dist";
@source "../../.yalc/@timmbr/ui/dist";
@source "../../node_modules/@timmbr/icons/dist";
@source "../../.yalc/@timmbr/icons/dist";
@source "./**/*.{js,ts,jsx,tsx}";
@source "../**/*.{js,ts,jsx,tsx}";
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

| Command                        | Description                                                                                                   |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------ |
| `pnpm ds:status`               | Inspect all `@timmbr/*` dependencies and show if they are **Registry (npm)** or **Yalc Link**                 |
| `pnpm ds:link [packages...]`   | Publishes and links specified packages (or all if none specified) into `timmbr-console`                       |
| `pnpm ds:unlink [packages...]` | Unlinks specified packages (or all if none specified) and restores clean NPM registry packages                |
| `pnpm commit`                  | Interactive conventional commit CLI; automatically unlinks Yalc and restores registry files before committing |

### Commit Safety & Automatic Unlinking

To prevent accidental commits of local `file:.yalc/...` paths into Git and breaking CI/CD:

- Running `pnpm commit` automatically checks if any `@timmbr/*` packages are linked.
- If linked, it automatically unlinks the design system, restores `package.json` and `pnpm-lock.yaml` to registry versions, stages them, and executes `git commit`.

### Making Subsequent Edits in `timmbr-ds`

Once linked via `pnpm ds:link`, you do not need to re-run link commands in `timmbr-console`. When making changes in `timmbr-ds`:

```bash
# In timmbr-ds/
pnpm yalc:push          # Rebuilds and pushes all packages to active apps
pnpm yalc:push ui       # Rebuilds and pushes @timmbr/ui only
pnpm yalc:push theme    # Rebuilds and pushes @timmbr/theme only
```

Turbopack will detect the updated files in `.yalc/` immediately and trigger Fast Refresh in your browser.
