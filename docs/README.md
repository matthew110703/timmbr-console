# Timmbr Console Knowledge Base & Documentation

Welcome to the central documentation hub for **Timmbr Console**, the administrative control plane for the Timmbr commerce platform.

---

## 📚 Table of Contents

### 1. Architecture

- **[System Design & Architecture](./architecture/system-design.md)**: Master architecture contract, technical stack, core principles, routing layout, and integration with `timmbr-core`.

### 2. Standards & Conventions

- **[Design System Guidelines](./conventions/design-system.md)**: Consumption standards, Tailwind CSS v4 setup, provider configuration, missing-component escalation, and local Yalc linking with `timmbr-ds`.
- **[Centralized API Client](./conventions/api-client.md)**: Architectural standards for API communication via `ApiClient`, token management, error handling, and form validation with `react-hook-form` + `zod`.
- **[Static Strings Convention](./conventions/strings.md)**: Co-located `strings.ts` files across all route segments for centralized, zero-hardcoded static UI copy.
- **[Environment Strategy](./conventions/environment.md)**: Runtime schema validation via Zod, client vs server env differentiation, and configuration defaults.
- **[Port Allocation Convention](./conventions/ports.md)**: Deterministic port allocation across the Timmbr platform ecosystem (`console: 5000`, `core: 3000`, `storefront: 8000+`).

---

## 🚀 Quick Command Reference

| Command            | Action                                                                                                        |
| :----------------- | :------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`         | Boot development server with Turbopack on Port 5000 (`next dev -p 5000`)                                      |
| `pnpm build`       | Create production Next.js build with SWC compiler                                                             |
| `pnpm start`       | Launch production build on Port 5000                                                                          |
| `pnpm check-types` | Run TypeScript type checking across entire application (`tsc --noEmit`)                                       |
| `pnpm lint`        | Run ESLint checks across codebase                                                                             |
| `pnpm ds:status`   | Inspect `@timmbr/*` design system dependency link status (Registry vs Yalc Local Link)                        |
| `pnpm ds:link`     | Publishes local packages from `../timmbr-ds/packages/*` into local Yalc store and links into `timmbr-console` |
| `pnpm ds:unlink`   | Unlinks all Yalc packages, restores clean NPM registry packages                                               |
