# Getting Started

Mapo is a Vue 3 / Nuxt 4 admin framework. This guide gets you from zero to a running Nuxt app with Mapo's core, store, and Camomilla integration wired up.

## Prerequisites

- Node.js >= 20
- pnpm >= 8 (or npm / yarn — examples below use pnpm)
- A Nuxt 4 application

## Install

Install the meta-package and (optionally) the Camomilla integration:

```bash
pnpm add mapomodule
pnpm add mapo-integrations-camomilla   # optional — only if you use Camomilla CMS
```

The `mapomodule` meta-package transparently installs `@mapomodule/core` and `@mapomodule/store`. You don't need to add them as separate dependencies.

## Configure

Add the modules to your `nuxt.config.ts` and configure them under the `mapo` and `camomilla` keys:

```ts
export default defineNuxtConfig({
  modules: [
    "@nuxt/ui",
    "mapomodule",
    "mapo-integrations-camomilla", // optional
  ],

  mapo: {
    authLoginUrl: "/api/auth/login",
    userInfoApi: "/api/profiles/me/",
    logoutUrl: "/api/auth/logout",
    loginUrl: "/login",
  },

  camomilla: {
    server: "http://localhost:8000",
    syncCamomillaSession: false,
  },
});
```

All `mapo` keys are optional — they fall back to the [defaults defined in `MAPO_DEFAULTS`](/modules/core#configuration).

## Use it

Mapo auto-imports its composables and stores. In any Vue component or page:

```vue
<script setup lang="ts">
const { login, logout } = useMapoAuth();
const auth = useAuthStore();
const repo = useCrud<{ id: number; title: string }>("/api/contents/");

async function loadContents() {
  const { results, count } = await repo.list({ page: 1 });
  return results;
}
</script>
```

Protect a page with the auth middleware:

```vue
<script setup lang="ts">
definePageMeta({ middleware: ["auth"] });
</script>
```

## Next steps

- **[Architecture & Flows](./architecture-flows)** — how SSR hydration, the fetch interceptor, and auth wire together
- **[Core module](/modules/core)** — full API reference for `useCrud`, `useMapoAuth`, the auth middleware
- **[Store module](/modules/store)** — auth, snack, confirm, sidebar stores + `usePermissions`
- **[Camomilla integration](/modules/camomilla)** — proxy setup, path rewriting, cookie sync
- **[Writing your own integration](/modules/integrations-howto)** — adapt Mapo to any backend
- **[Known limitations](./known-limitations)** — what to expect during migration to v2

## Reference example

The repo ships an `apps/example/` Nuxt 4 app exercising every composable and store. Clone the repo and:

```bash
pnpm install
pnpm dev:example
```

Open `http://localhost:3000` to play with login, CRUD, multipart upload, permissions, snackbar, confirm, and sidebar persistence.
