# Timmbr Console Architecture & System Design

**Platform Target**: `@timmbr/console`  
**Architecture Pattern**: Next.js 16 App Router (RSC, Turbopack, Server Actions)  
**Package Manager & Toolchain**: `pnpm` + Turbopack (Dev Bundler) + SWC (Transpiler/Minifier)  
**Design System**: Timmbr Design System (`@timmbr/*`)  
**Backend Target**: `timmbr-core` (NestJS / Fastify REST API, Port 3000)

---

## 1. Executive Summary & Core Principles

**Timmbr Console** is the administrative web application for managing the Timmbr commerce platform. It is engineered as a standalone Next.js App Router application optimized for administrative ergonomics, operational efficiency, and strict design fidelity.

### Key Architectural Commitments

1. **Standalone Architecture**: Operates as an independent Next.js App Router application running on **Port 5000**, distinct from `timmbr-storefront` (Port 8000) and `timmbr-core` (Port 3000).
2. **Server-First Principle**: Leverage React Server Components (RSC) by default for data fetching, static layout rendering, and administrative page skeletons. Reserve Client Components (`"use client"`) strictly for interactive controls, stateful forms, modal dialogs, and dynamic filter tables.
3. **Strict Design System Consumption**: All UI primitives, tokens, and iconography are consumed directly from `@timmbr/*` packages. No ad-hoc styled elements or third-party component libraries are permitted.
4. **Co-located Static Copy**: Zero hardcoded UI strings in `page.tsx` or `layout.tsx`. Every route segment maintains a co-located `strings.ts` file.
5. **Centralized Backend Communication**: All interactions with `timmbr-core` flow through the typed `ApiClient` singleton (`lib/api/client.ts`). Raw `fetch()` calls in UI components are strictly forbidden.
6. **Form Handling & Validation**: Standardized on `react-hook-form` paired with `zod` schemas for type-safe client-side validation and consistent error state reporting.

---

## 2. Repository Layout

```text
timmbr-console/
├── .agents/                 # AI Coding Assistant rules and guidelines
├── docs/                    # Central Platform Knowledge Base
│   ├── README.md            # Knowledge base index
│   ├── architecture/        # System design & architecture specs
│   └── conventions/         # Design system, API client, strings, env, ports
├── app/                     # Next.js App Router root
│   ├── (auth)/              # Public authentication route group
│   │   ├── layout.tsx       # Auth container shell layout
│   │   └── login/           # Admin login route segment
│   │       ├── page.tsx     # Login view
│   │       └── strings.ts   # Co-located login copy & labels
│   ├── (console)/           # Protected administrative route group
│   │   ├── layout.tsx       # Administrative sidebar & topbar shell
│   │   └── dashboard/       # Dashboard analytics & KPI overview
│   │       ├── page.tsx     # Dashboard view
│   │       └── strings.ts   # Co-located dashboard copy
│   ├── globals.css          # Tailwind CSS v4 & theme injection
│   ├── layout.tsx           # Global HTML root layout & TimmbrConfigProvider
│   ├── page.tsx             # Root redirect to /dashboard or /login
│   └── strings.ts           # Global root metadata & navigation copy
├── lib/                     # Shared application utilities & services
│   ├── api/                 # Centralized API layer
│   │   ├── client.ts        # Typed ApiClient implementation & ApiError
│   │   └── auth.ts          # Authentication service calls
│   └── env.ts               # Type-safe environment validation (Zod)
├── scripts/                 # Operational tooling
│   └── ds-link.js           # Yalc-powered local design system link orchestrator
├── types/                   # TypeScript interfaces & API response contracts
├── .env.example             # Committed local environment variable defaults
├── .env.local               # Local developer environment overrides (gitignored)
├── AGENTS.md                # AI Agent architectural & operational rules
├── package.json             # Application dependencies & operational scripts
├── tsconfig.json            # TypeScript configuration (moduleResolution: "bundler")
└── next.config.ts           # Next.js configuration & package transpilation
```

---

## 3. Route Groups & Routing Model

Timmbr Console organizes administrative screens into two primary route groups:

### 1. `app/(auth)` — Public Authentication Group

- **Purpose**: Houses administrative authentication, multi-factor verification, and credential recovery flows.
- **Layout**: Centered, distraction-free card container on warm neutral backdrop.
- **Access**: Publicly accessible; redirects authenticated users to `/dashboard`.

### 2. `app/(console)` — Protected Administrative Group

- **Purpose**: Houses the core administrative workspace, catalogs, and commerce management tools.
- **Layout**: Persistent sidebar navigation, global topbar, breadcrumb hierarchy, user profile dropdown, and scrollable content canvas.
- **Access**: Guarded; redirects unauthenticated visitors to `/login`.
- **Target Feature Modules**:
  - `/dashboard`: High-level metrics, operational KPIs, and recent activities.
  - `/products`: Catalog management, variant configuration, and pricing.
  - `/inventory`: Stock levels, locations, and replenishment tracking.
  - `/orders`: Order fulfillment, shipment lifecycle, and refunds.
  - `/categories`: Taxonomy and catalog navigation hierarchy.
  - `/customers`: Registered customer management and user directory.

---

## 4. Backend Integration (`timmbr-core`)

All administrative mutations and data queries interface with `timmbr-core`:

- **Protocol**: RESTful JSON API over HTTP.
- **Base Endpoint**: `${NEXT_PUBLIC_API_URL}/api/v1` (default: `http://localhost:3000/api/v1`).
- **Authentication**: JWT Bearer token passed in the `Authorization: Bearer <token>` header.
- **Token Lifecycle**:
  - Access tokens stored securely in memory / HTTP-only session cookies.
  - Automatic silent refresh via `/auth/refresh` on expired tokens.
  - Handled transparently by `ApiClient.request()` with unified 401 interceptor logic.

---

## 5. Toolchain & Compilers

- **Next.js 16.3.5**: Native App Router with React 19 and Turbopack.
- **Turbopack**: Primary development bundler with near-instant hot module reloading (`next dev -p 5000`).
- **SWC**: Native Rust transpilation and minification for production builds (`next build`).
- **TypeScript 5**: Strict mode enabled with `"moduleResolution": "bundler"`.
- **Tailwind CSS v4**: Modern CSS-first engine via `@tailwindcss/postcss` and `@timmbr/theme/theme.css`.
