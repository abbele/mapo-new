# @mapomodule/example

Core feature demo app for Mapo v2. Exercises authentication, CRUD, multipart upload, permissions, snackbar, confirm dialog, and sidebar persistence against a real backend.

## Prerequisites

A running [Camomilla CMS](https://github.com/lotrekagency/camomilla) instance (or any compatible Django REST backend) at `http://localhost:8000`.

## Run

From the monorepo root:

```bash
pnpm install
pnpm dev:example        # http://localhost:3000
```

Or from this directory:

```bash
pnpm dev
```

## What's demonstrated

| Page           | Feature                                                               |
| -------------- | --------------------------------------------------------------------- |
| `/login`       | `useMapoAuth().login()`, redirect after auth                          |
| `/authexample` | `meta.permissions` with `{ model }` format, `pagePermissions` display |
| `/settings`    | `meta.sidebarFooter` — page appears in sidebar footer                 |

## Configuration

Edit `nuxt.config.ts` to point `camomilla.server` at your backend:

```ts
camomilla: {
  server: "http://localhost:8000",
  syncCamomillaSession: false,
},
```

## See also

- [`apps/example-theme/`](../example-theme/) — theming & MapoOverride demo (no backend needed)
