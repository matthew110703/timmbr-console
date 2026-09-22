# Timmbr Console

The administrative web application for managing the Timmbr commerce platform.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Turbopack / SWC**.

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
