# Architectural Rules for AI Agents (Timmbr Console)

1. **Standalone Architecture**: Timmbr Console is a standalone Next.js App Router application. All administrative features live within `app/(console)/` and authentication within `app/(auth)/`.
2. **Server-First Principle**: Use Server Components by default. Use Client Components (`"use client"`) only where interactivity requires them (interactive forms, tables, filters, dialogs, dropdowns).
3. **Strict Design System Consumption**:
   - All UI elements and components MUST be imported from `@timmbr/ui`, `@timmbr/theme`, `@timmbr/motion`, `@timmbr/icons`, and `@timmbr/hooks`.
   - Never build ad-hoc styled elements or custom components when a Design System primitive exists.
4. **Missing Component Protocol**:
   - If an element or component is not present in `@timmbr/ui`, NEVER build an unapproved substitute.
   - Stop and notify the user immediately, explaining the requirement and suggesting whether it should be contributed to `@timmbr/ds` or composed from existing primitives with user consent.
5. **Strict Consent for Design Deviations**:
   - Colors, typography scales, radius values, and layout tokens must strictly follow `@timmbr/theme`. Any changes or departures strictly require explicit user consent.
6. **Co-located Static Strings (`strings.ts`)**:
   - Every route segment under `app/` (such as `app/strings.ts`, `app/(auth)/login/strings.ts`, `app/(console)/dashboard/strings.ts`) MUST maintain a co-located `strings.ts` file containing all static UI copy, labels, headings, error messages, and descriptions.
   - Never hardcode static UI text directly in `page.tsx` or `layout.tsx`.
7. **Centralized API Communication**:
   - Centralize all backend API interactions in `lib/api/` via the typed `ApiClient` instance (`lib/api/client.ts`).
   - Never scatter raw `fetch()` calls throughout UI components.
8. **Form Handling & Validation**:
   - Standardize client-side forms on `react-hook-form` + `zod` for type-safe validation.
9. **Compiler & Bundler Standards**:
   - Use Turbopack (`next dev`) for development, SWC for transpilation, and configure `"moduleResolution": "bundler"` in `tsconfig.json`.
10. **Design System Linking via Yalc**:
    - For local development with `../timmbr-ds`, use `pnpm ds:link` (powered by Yalc) to preserve Next.js Turbopack compatibility. Never use raw `pnpm link` pointing outside the workspace.
11. **No Automatic Git Staging or Committing**:
    - NEVER run `git add`, `git commit`, `git push`, or automatically stage/commit files. Staging and committing changes is strictly the user's prerogative unless explicitly requested.
