# Architectural & Operational Rules for AI Agents (Timmbr Console)

1. **Standalone Architecture**: Timmbr Console is a standalone Next.js App Router application. All administrative features live within `app/(console)/` and authentication within `app/(auth)/`.
2. **Server-First Principle**: Use Server Components by default. Use Client Components (`"use client"`) only where interactivity requires them (interactive forms, tables, filters, dialogs, dropdowns).
3. **Strict Design System Consumption (Component-First Hierarchy)**:
   - **First Priority**: Before writing any UI markup, ALWAYS check `@timmbr/ui` to verify if a matching component exists (e.g. `Container`, `Center`, `Stack`, `Inline`, `Card`, `Heading`, `Text`, `Button`, `Input`, `Alert`, `Badge`, `Dropdown`, `Dialog`, `Table`, etc.).
   - **Mandatory Layout Containers**: Every layout file (`layout.tsx`) MUST wrap its main content with `@timmbr/ui`'s `Container` primitive.
   - **Layout Primitives over Flex/Div**: Use `Center`, `Stack`, and `Inline` for layout alignment, centering, and vertical/horizontal rhythm instead of raw `flex`, `items-center`, `justify-center`, or wrapper `div`s.
   - Always use `@timmbr/ui` primitives instead of native HTML elements (`<div>`, `<h1>`-`<h6>`, `<p>`, `<button>`, `<input>`) for cards/surfaces, typography, form controls, and layout stacks.
   - Native HTML elements are ONLY permitted for semantic tags (like `<form>`, `<main>`, `<nav>`) or when no suitable primitive exists in `@timmbr/ui`. Any other use of native elements requires explicit architectural justification.
   - Never build ad-hoc styled elements or custom components when a Design System primitive exists.
4. **Missing Component Protocol**:
   - If an element or component is not present in `@timmbr/ui`, NEVER build an unapproved substitute.
   - Stop and notify the user immediately, explaining the requirement and suggesting whether it should be contributed to `@timmbr/ds` or composed from existing primitives with user consent.
5. **Strict Consent for Design Deviations**:
   - Colors, typography scales, radius values, and layout tokens must strictly follow `@timmbr/theme`. Any changes or departures strictly require explicit user consent.
6. **Co-located Static Strings (`strings.ts`)**:
   - Every route segment under `app/` (such as `app/strings.ts`, `app/(auth)/login/strings.ts`, `app/(console)/dashboard/strings.ts`) MUST maintain a co-located `strings.ts` file containing all static UI copy, labels, headings, error messages, and descriptions.
   - Never hardcode static UI text directly in `page.tsx` or `layout.tsx`.
7. **Modular API Architecture & Global Client**:
   - The global `ApiClient` singleton (`src/lib/api/client.ts`) and global route dictionary (`src/lib/api/routes.ts`) stay in `src/lib/api/`.
   - All module/feature-specific API services MUST live within their respective module folder under an `api/` directory (e.g. `src/app/(auth)/api/auth.ts`, `src/app/(console)/orders/api/orders.ts`).
   - Never clutter `src/lib/api/` with domain-specific endpoint functions.
   - Never scatter raw `fetch()` calls or hardcoded URL strings throughout UI components.
8. **Form Handling & Validation (`validationSchema.ts`)**:
   - Standardize client-side forms on `react-hook-form` + `zod` for type-safe validation.
   - Validation schemas and resolvers MUST live in a co-located `validationSchema.ts` file in the same folder as the form component (e.g. `src/app/(auth)/login/validationSchema.ts`).
   - Frontend validation rules MUST strictly mirror `timmbr-core` backend DTO validations (e.g. identical password regex, email normalization).
9. **Compiler & Bundler Standards**:
   - Use Turbopack (`next dev`) for development, SWC for transpilation, and configure `"moduleResolution": "bundler"` in `tsconfig.json`.
10. **Design System Linking via Yalc**:
    - For local development with `../timmbr-ds`, use `pnpm ds:link` (powered by Yalc) to preserve Next.js Turbopack compatibility. Never use raw `pnpm link` pointing outside the workspace.
11. **No Automatic Git Staging or Committing**:
    - NEVER run `git add`, `git commit`, `git push`, or automatically stage/commit files. Staging and committing changes is strictly the user's prerogative unless explicitly requested.
12. **Root-Level `src/components/` (No Components inside `app/`)**:
    - All custom application components MUST live at the root `src/components/` level (e.g. `src/components/ConsoleSidebar.tsx`).
    - NEVER create or maintain `components/` folders inside `src/app/` or any route segment. Route directories under `src/app/` are strictly reserved for App Router primitives (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`) and co-located `strings.ts`.
13. **Authentication, Refresh Tokens & Role-Based Authorization (RBAC)**:
    - `ApiClient` must automatically manage token refresh: on a `401 Unauthorized` response, concurrent requests are queued while `POST /auth/refresh` executes with credentials. On success, requests replay with the refreshed token; on failure, the session is cleared and the user is redirected to `/login`.
    - Only accounts with role `ADMIN` or `MASTER` are permitted access to `timmbr-console`. Users with the storefront `USER` role must be rejected with an unauthorized error.
14. **Proxy & Auth Guards (`src/proxy.ts`)**:
    - `src/proxy.ts` (Next.js 16 proxy convention, replacing deprecated `middleware.ts`) acts as the primary gatekeeper for authentication and authorization.
    - Unauthenticated requests to protected administrative routes (`/overview`, `/orders`, `/products`, etc.) or root (`/`) MUST be redirected to `/login` with the `from` return query parameter (e.g. `/login?from=/overview`).
    - Requests bearing a valid `timmbr_access_token` but possessing a non-administrative role (`USER`) are denied and redirected to `/login?error=unauthorized` while clearing the cookie.
    - Already-authenticated admins accessing `/login` are automatically redirected to `/overview` (or the `from` target if valid).
    - `ConsoleLayout` provides defense-in-depth verification on the server before rendering administrative layouts, also maintaining the `from` redirect parameter.
15. **Cookie Handling Boundaries (`next/headers` vs `js-cookie`)**:
    - **Server Components & Route Handlers**: Use `await cookies()` from `next/headers` for reading cookies on the server (e.g. `ConsoleLayout`), and `request.cookies`/`response.cookies` in `src/proxy.ts`. Never import or access `document.cookie` or `js-cookie` on the server.
    - **Client Components & Browser API Services**: Use `js-cookie` in `session.ts` and client components for synchronous access without extra network hops. Never import `cookies` from `next/headers` into client-side code (`"use client"`), as it is a server-only API and will crash the browser bundle.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
