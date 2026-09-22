---
name: design-system
description: Mandatory rules, catalog reference, provider layering, and missing-component escalation protocol for the @timmbr design system in Timmbr Console.
---

# Timmbr Design System Consumption & Conventions (Console)

This skill provides comprehensive guidelines, component catalogues, and escalation workflows for building frontends across the `Timmbr Console` application.

---

## 1. Golden Rules of Design System Usage

1. **Exclusive Component Usage**:
   - Every visual element, layout container, button, form control, overlay, and feedback indicator MUST be imported from `@timmbr/ui`, `@timmbr/theme`, `@timmbr/motion`, `@timmbr/icons`, and `@timmbr/hooks`.
   - **Only Exception**: Dedicated, domain-specific app components (e.g. `OrderMetricCard`, `ProductStatusBadge`) that compose DS primitives.
2. **Missing Component Escalation Protocol**:
   - If an element or component is missing from the DS, **NEVER** arbitrarily create a custom HTML element or local ad-hoc UI component.
   - **Protocol**:
     1. Stop and notify the user immediately: _"Component `<X>` is not present in `@timmbr/ui`."_
     2. Provide a rationale and suggestion: _"Should this component be contributed to `@timmbr/ds` or should we use primitive composition `<Y>` with user approval?"_
     3. Await explicit user direction.
3. **Strict Consent for Visual Deviations**:
   - Changes outside the Design System tokens (specifically custom palette colors, themes, radius scales, or alternate layout philosophies) require explicit user consent.
4. **Co-located Strings (`strings.ts`)**:
   - Combine DS usage with Rule 6: Never hardcode button text, labels, or content inside DS components. Always import from `./strings`.

---

## 2. Package Architecture

| Package              | Purpose                              | Primary Exports / Primitives                                                                                                                                           |
| :------------------- | :----------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@timmbr/ui`**     | Component Library                    | `Container`, `Stack`, `Inline`, `Grid`, `Center`, `Button`, `Card`, `Badge`, `Heading`, `Text`, `Input`, `Dialog`, `Toast`, `DataList`, `Chip`, `TimmbrConfigProvider` |
| **`@timmbr/theme`**  | Design Tokens & Tailwind v4 `@theme` | Tokens (`colors`, `typography`, `radius`, `spacing`, `shadows`), `theme.css`                                                                                           |
| **`@timmbr/motion`** | Transitions & Layout Animations      | `motion`, `AnimatePresence`, `LayoutGroup`, transitions, variants, gestures                                                                                            |
| **`@timmbr/icons`**  | Icons & SVGs                         | `<Icon name="..." />`, `SpinnerIcon`, Lucide re-exports (`ArrowRight`, `Check`, `Sparkles`, etc.)                                                                      |
| **`@timmbr/hooks`**  | Shared React Hooks                   | `useMediaQuery`, `useControllableState`, `useMounted`                                                                                                                  |

---

## 3. Component Catalog Quick Reference

### Layout Primitives

- **`Container`**: Max-width wrapper (`maxWidth="sm" | "md" | "lg" | "xl" | "2xl" | "full"`).
- **`Stack`**: Vertical flex layout with tokenized `gap` (`1` to `24`), `align`, and optional `divider`.
- **`Inline`**: Horizontal flex layout with wrapping, tokenized `gap`, and optional `divider`.
- **`Grid`**: CSS grid with responsive `cols` (`1` to `12`), `autoFit`, `minChildWidth`, and `gap`.
- **`Center`**: Centering container along vertical and horizontal axes.

### Data & Display

- **`Heading`**: Headings (`level={1 | 2 | 3 | 4 | 5 | 6}`, `font="display" | "title"`).
- **`Text`**: Body typography (`variant="body-1" | "body-2" | "body-3" | "subtitle-1"`, `foreground="default" | "muted" | "subtle" | "primary"`).
- **`Button`**: Interactive button (`variant="default" | "outline" | "ghost" | "destructive"`, `size="default" | "sm" | "lg" | "icon"`, supports `asChild`, `loading`, `leftIcon`, `rightIcon`).
- **`Badge`**: Status indicator (`variant="primary" | "brand" | "outline" | "subtle" | "success" | "destructive"`, `dot={true}`).
- **`Card`**: Card surface (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).
- **`DataList`**: Key-value data display with divider and icon support.

---

## 4. App Setup & Configuration Layering

1. **Root Layout Provider**:
   Wrap the application body inside `<TimmbrConfigProvider>` from `@timmbr/ui` with Google Fonts (`Manrope`, `DM Serif Display`, `Outfit`).
2. **Tailwind CSS v4 & Theme**:
   In `app/globals.css`:
   ```css
   @import "tailwindcss";
   @import "@timmbr/theme/theme.css";

   @source "./node_modules/@timmbr/ui/dist";
   @source "./node_modules/@timmbr/icons/dist";
   @source "./app/**/*.{js,ts,jsx,tsx}";
   @source "./components/**/*.{js,ts,jsx,tsx}";
   ```
3. **Transpilation**:
   In `next.config.ts`:
   ```ts
   transpilePackages: [
     "@timmbr/ui",
     "@timmbr/theme",
     "@timmbr/motion",
     "@timmbr/icons",
     "@timmbr/hooks",
     "@timmbr/utils",
   ],
   ```

---

## 5. Local Development Linking Commands (Yalc)

When developing features in parallel with the Design System repository located at `../timmbr-ds`:

- **Check Link Status**:
  ```bash
  pnpm ds:status
  ```
- **Link Local Design System (Yalc)**:
  ```bash
  pnpm ds:link
  ```
- **Unlink & Restore Registry**:
  ```bash
  pnpm ds:unlink
  ```
