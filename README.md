# Timmbr Console

The administrative web application for managing the Timmbr commerce platform.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Turbopack / SWC**.

---

## 📚 Documentation & Knowledge Base

For detailed technical specifications, architecture decisions, and coding standards, visit the [**Timmbr Console Documentation Hub**](./docs/README.md):

- **[System Design & Architecture](./docs/architecture/system-design.md)**: Route groups, Server-First principle, and `timmbr-core` integration.
- **[Design System Guidelines](./docs/conventions/design-system.md)**: `@timmbr/*` consumption rules, Tailwind v4 setup, and Yalc local workflow.
- **[Centralized API Client](./docs/conventions/api-client.md)**: `ApiClient` patterns, token management, and Zod form validation.
- **[Static Strings Convention](./docs/conventions/strings.md)**: Co-located `strings.ts` pattern across all route segments.
- **[Environment Strategy](./docs/conventions/environment.md)**: Type-safe runtime environment schema validation.
- **[Port Allocation](./docs/conventions/ports.md)**: Ecosystem-wide port coordination (`console: 5000`).

---

## 📁 Repository Layout

```text
timmbr-console/
├── .agents/                 # AI Agent operational rules & guidelines
├── docs/                    # Central Documentation Hub
│   ├── README.md            # Knowledge base index & TOC
│   ├── architecture/        # System design & architecture specs
│   └── conventions/         # Design system, API client, strings, env, ports
├── app/                     # Next.js App Router root
│   ├── (auth)/              # Public authentication route group (/login)
│   ├── (console)/           # Protected administrative workspace (/dashboard, etc.)
│   ├── globals.css          # Tailwind CSS v4 & @timmbr/theme injection
│   ├── layout.tsx           # Global HTML root layout & TimmbrConfigProvider
│   └── strings.ts           # Root-level metadata & static copy
├── lib/                     # Application infrastructure & services
│   ├── api/                 # Typed ApiClient instance & domain service modules
│   └── env.ts               # Type-safe Zod runtime environment schema
├── scripts/                 # Operational tooling
│   └── ds-link.js           # Yalc design system linking orchestrator
├── types/                   # Shared TypeScript definitions & API contracts
├── .env.example             # Committed local environment variable defaults
├── .env.local               # Local developer overrides (gitignored)
├── AGENTS.md                # Architectural & operational rules for AI agents
├── package.json             # Dependencies & operational scripts
├── tsconfig.json            # TypeScript configuration (moduleResolution: bundler)
└── next.config.ts           # Next.js configuration & package transpilation
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Default configuration:

```env
PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:5000](http://localhost:5000) to view the console.

---

## 🎨 Local Design System Linking (`../timmbr-ds`)

Timmbr Console consumes the **Timmbr Design System** through published npm packages (`@timmbr/ui`, `@timmbr/theme`, `@timmbr/icons`, etc.).

When developing components concurrently in `../timmbr-ds`, the application uses **`yalc`** for local package linking:

| Command          | Description                                                                                                   |
| :--------------- | :------------------------------------------------------------------------------------------------------------ |
| `pnpm ds:status` | Inspect all `@timmbr/*` dependencies and show if they are **Registry (npm)** or **Yalc Local Link**           |
| `pnpm ds:link`   | Publishes local packages from `../timmbr-ds/packages/*` into local Yalc store and links into `timmbr-console` |
| `pnpm ds:unlink` | Unlinks all Yalc packages, removes `.yalc/`, and restores published NPM registry packages                     |

### Making Subsequent Edits in `timmbr-ds`

Once linked via `pnpm ds:link`, you **do not** need to re-link `timmbr-console` after making further edits. Simply run in `timmbr-ds`:

```bash
# In timmbr-ds/
pnpm yalc:push          # Rebuilds and pushes all packages to active apps
pnpm yalc:push ui       # Rebuilds and pushes @timmbr/ui only
pnpm yalc:push theme    # Rebuilds and pushes @timmbr/theme only
```

Next.js Turbopack will immediately detect the updated files in `.yalc/` and trigger Fast Refresh automatically.

---

## 🧪 Verification Commands

| Command            | Purpose                                   |
| :----------------- | :---------------------------------------- |
| `pnpm check-types` | TypeScript type-checking (`tsc --noEmit`) |
| `pnpm lint`        | ESLint checks                             |
| `pnpm build`       | Production Next.js build                  |
