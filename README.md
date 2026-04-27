# Mapo

Mapo is a Vue 3 / Nuxt 4 admin framework for building backoffice interfaces declaratively. It provides a CRUD engine, a typed form system, media management, authentication, and a composable UI kit — all as individual packages that can be used together or independently.

## Packages

| Package                    | Description                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `@mapomodule/core`         | API layer (`CrudRepository`), auth composables, HTTP interceptors, Nuxt middleware     |
| `@mapomodule/store`        | Pinia stores: auth, media, snack, confirm, sidebar                                     |
| `@mapomodule/form`         | Declarative typed form engine and field components                                     |
| `@mapomodule/uikit`        | UI components: Sidebar, Topbar, List, Detail, Media, Menu                              |
| `@mapomodule/utils`        | Typed utilities: `deepMerge`, `objectDiff`, `debounce`, `formatDate`, `buildRouteTree` |
| `@mapomodule/integrations` | Adapter loader with formal TypeScript interface                                        |
| `@mapomodule/i18n`         | `@nuxtjs/i18n` v9 wrapper with base translations                                       |
| `@mapomodule/routemeta`    | Placeholder — eliminated after DP-1 (see `docs/DECISIONS.md`)                          |
| `mapomodule`               | Meta-package: installs all `@mapomodule/*` modules with a single `installModule` call  |

## Requirements

- Node.js >= 20
- pnpm >= 8

## Getting Started

```bash
pnpm install
```

## Scripts

### Development

| Script             | Description                                       |
| ------------------ | ------------------------------------------------- |
| `pnpm dev:example` | Start the Nuxt 4 example app dev server           |
| `pnpm docs:dev`    | Start the VitePress documentation site dev server |

### Build

| Script            | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| `pnpm build`      | Build all packages via Turborepo (respects dependency order) |
| `pnpm docs:build` | Build the VitePress documentation site                       |

### Quality

| Script           | Description                                      |
| ---------------- | ------------------------------------------------ |
| `pnpm lint`      | Run ESLint across all packages via Turborepo     |
| `pnpm typecheck` | Run TypeScript type checking across all packages |
| `pnpm test`      | Run Vitest unit tests and Cypress E2E tests      |

### Release

| Script                  | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `pnpm release:dry`      | Simulate the full release locally — no tags, no publish       |
| `pnpm release`          | Build and release all packages (used by CI on push to `main`) |
| `pnpm publish:packages` | Emergency manual publish, bypasses semantic-release           |

## Release Flow

Releases are powered by [multi-semantic-release](https://github.com/qiwi/multi-semantic-release). Versioning is driven by [Conventional Commits](https://www.conventionalcommits.org/) — no manual bumping required.

> **Current status**: the CI pipeline runs manually (`workflow_dispatch`). Automatic triggering on push to `main` will be enabled in the future.

See [docs/guide/release-process.md](docs/guide/release-process.md) for the full release documentation.

## Monorepo Structure

```
packages/@mapomodule/       individual @mapomodule/* packages
packages/mapomodule/  meta-package
apps/example/         Nuxt 4 demo and test app
docs/                 VitePress documentation site
```
