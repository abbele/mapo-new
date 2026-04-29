# mapomodule

The Mapo meta-module: a single Nuxt module that registers the entire Mapo stack with one entry in `nuxt.config.ts`.

## Installation

```bash
pnpm add mapomodule @nuxt/ui
```

```ts
// nuxt.config.ts — @nuxt/ui MUST come before mapomodule
export default defineNuxtConfig({
  modules: ["@nuxt/ui", "mapomodule"],

  mapo: {
    authLoginUrl: "/api/auth/login",
    userInfoApi: "/api/profiles/me/",
    logoutUrl: "/api/auth/logout",
    loginUrl: "/login",

    uikit: {
      css: "~/assets/css/theme.css", // optional CSS token override
      ui: { button: { defaultVariants: { color: "primary" } } }, // optional Nuxt UI defaults
    },
  },
});
```

All options are optional and fall back to `MAPO_DEFAULTS`.

## What it installs

| Package             | Status                                      |
| ------------------- | ------------------------------------------- |
| `@mapomodule/store` | ✅ Pinia stores                             |
| `@mapomodule/core`  | ✅ Service layer (forwards `mapo` config)   |
| `@mapomodule/uikit` | ✅ UI shell + theming + MapoOverride system |
| `@mapomodule/form`  | 🔲 Planned                                  |
| `@mapomodule/i18n`  | 🔲 Planned                                  |

## Dev workflow

```bash
# watch mode — rebuilds dist/ on src/ changes
pnpm dev:mapomodule   # from monorepo root
```

## Reference

- [`@mapomodule/core`](../@mapomodule/core/) — CRUD, auth, middleware
- [`@mapomodule/store`](../@mapomodule/store/) — Pinia stores
- [`@mapomodule/uikit`](../@mapomodule/uikit/) — UI shell, theming, MapoOverride
- [docs/modules/core](../../docs/modules/core.md) — full config reference
