# mapomodule

The Mapo meta-module: a single Nuxt module that registers the entire Mapo stack with one entry in your `nuxt.config.ts`.

## Installation

```bash
pnpm add mapomodule
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["mapomodule"],

  mapo: {
    // optional — falls back to MAPO_DEFAULTS
    authLoginUrl: "/api/auth/login",
    userInfoApi: "/api/profiles/me/",
    logoutUrl: "/api/auth/logout",
    loginUrl: "/login",
  },
});
```

## What it installs

Currently:

- [`@mapomodule/store`](../@mapomodule/store) — Pinia stores
- [`@mapomodule/core`](../@mapomodule/core) — service layer (forwards your `mapo` config to it)

Reserved (placeholders, will be installed once implemented):

- `@mapomodule/form`
- `@mapomodule/uikit`
- `@mapomodule/i18n`
- `@mapomodule/routemeta`

## Why a meta-module

So consumers don't have to:

- list every `@mapomodule/*` package as a dependency,
- add each one to `modules[]`,
- learn each module's `configKey` (`mapoCore`, etc.).

You configure once under `mapo` and get the whole stack.

## Configuration forwarding

The module accepts `MapoOptions` from `@mapomodule/core` under its `configKey: 'mapo'` and forwards them to `installModule('@mapomodule/core', options)`. Any option valid in `@mapomodule/core` is valid here.

> **Note**: `installModule` is currently used as the integration mechanism. Nuxt has flagged it as deprecated; we track this in [docs/guide/known-limitations](../../docs/guide/known-limitations.md).
