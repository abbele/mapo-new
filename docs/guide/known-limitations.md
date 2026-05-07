# Known Limitations & TODOs

This page documents known technical debts, workarounds, and planned improvements in the current Mapo v2 implementation. Items are tagged with their priority and the phase in which they are expected to be addressed.

---

## `installModule` deprecation warning

**Affects**: `@mapomodule/store/src/module.ts`, `mapomodule/src/module.ts`

**Status**: Low risk, functional

Both modules call `await installModule('@pinia/nuxt')` and `await installModule('@mapomodule/core')` respectively. Recent `@nuxt/kit` typings mark `installModule` as deprecated with a hint message, but it still works correctly at runtime and no replacement pattern exists yet for "module installs another module" in Nuxt 4.

**Workaround in use**: Continue using `installModule` — the deprecation is a hint, not a breaking change.

**TODO**: Monitor [nuxt/kit](https://github.com/nuxt/nuxt) for an official replacement. When one lands, update both module files.

---

## Subpath imports required in runtime code

**Affects**: `@mapomodule/core/src/runtime/**`, any package that imports stores at runtime

**Status**: Active workaround required

`nuxt-module-builder` compiles packages and generates `.d.ts` type declaration files. For the main entry (`@mapomodule/store`) this resolves to `dist/module.mjs` — the Nuxt module file that imports `@nuxt/kit`. Importing `@mapomodule/store` from runtime code (plugins, composables) causes `@nuxt/kit` to be loaded in a browser context, which fails.

The fix: always use subpath imports in runtime code:

```ts
// Correct
import { useAuthStore } from "@mapomodule/store/runtime/stores/auth";

// Wrong — imports @nuxt/kit, breaks in client context
import { useAuthStore } from "@mapomodule/store";
```

In Vue components and pages, `useAuthStore` is auto-imported by Nuxt and this does not apply.

**Root cause**: `nuxt-module-builder` conflates the module entry (Nuxt lifecycle code) with the runtime exports. There is no standard way to express "this package has both a Nuxt module entry and runtime exports" cleanly in a single `package.json` `exports` map with correct `.d.ts` generation.

**TODO**: Investigate splitting `@mapomodule/store` into two separate entry points with proper `.d.ts` in the `exports` map, or follow upstream `nuxt-module-builder` improvements for runtime subpath exports.

---

## tsconfig `paths` workaround in `@mapomodule/core`

**Affects**: `packages/@mapomodule/core/tsconfig.json`

**Status**: Active workaround required

`nuxt-module-builder` generates empty `.d.ts` files for runtime subpath imports (e.g. `@mapomodule/store/runtime/stores/auth`). This causes TypeScript to see no types when `@mapomodule/core` imports from `@mapomodule/store/runtime/*`.

The fix is a `paths` override in `@mapomodule/core/tsconfig.json` that points TypeScript directly at the source `.ts` files during development:

```json
"paths": {
  "@mapomodule/store": ["./node_modules/@mapomodule/store/src/index.ts"],
  "@mapomodule/store/runtime/stores/*": ["./node_modules/@mapomodule/store/src/runtime/stores/*.ts"],
  "@mapomodule/store/runtime/*": ["./node_modules/@mapomodule/store/src/runtime/*.ts"]
}
```

**Limitation**: This only works when `@mapomodule/store` is installed as a local workspace package (monorepo development). It will not work for external consumers who install `@mapomodule/store` from npm.

**TODO**: The long-term fix is proper `.d.ts` generation for runtime subpath exports in `nuxt-module-builder`. Track upstream. As a medium-term alternative, consider publishing a separate `@mapomodule/store-runtime` package that contains only the composables/stores with no `@nuxt/kit` dependency.

---

## `@mapomodule/core` plugin registration is hardcoded in `mapomodule` only

**Affects**: Users who use `@mapomodule/core` directly without `mapomodule`

**Status**: By design, but underdocumented

The `$mapoFetch` plugin (`00.fetch.ts`) is registered by `@mapomodule/core/src/module.ts`. If someone installs `@mapomodule/core` standalone (without `mapomodule`), they still get `$mapoFetch` — it's fine. However, if a user wants to override the 401/403 behaviour, there is no hook for it short of forking the plugin.

**TODO (Phase 2)**: Add `mapoCore.onUnauthorized` and `mapoCore.onForbidden` config hooks so the behaviour can be overridden without forking.

---

## Auth store has no loading/pending state

**Affects**: SSR hydration, login transitions

**Status**: By design for now — Phase 1 scope

The auth store has no `isLoading` flag. During the SSR init plugin, there is a brief window between plugin start and `setUser()` where `isAuthenticated` is false. Route middleware runs after the plugin resolves, so in practice this does not cause issues — but for loading skeletons or animated transitions, a pending state would be useful.

**TODO (Phase 2)**: Add `auth.isPending: boolean` state — `true` during `fetchUser()` calls, `false` once resolved.

---

## No automatic token refresh

**Affects**: Long-lived sessions

**Status**: Intentional for v2 — session-cookie-based auth does not require explicit refresh

Django session cookies have a configurable lifetime (typically 2 weeks). When the session expires, the next request returns 401, the `00.fetch.ts` interceptor calls `authStore.reset()` and redirects to `/login`. The user must log in again.

**TODO (future)**: If the backend supports session sliding expiry (Django `SESSION_SAVE_EVERY_REQUEST = True`), sessions auto-extend on activity. No Mapo code changes are needed — Django handles it. Document recommended Django session settings.

---

## `mapo-integrations-camomilla` double slash bug fixed — but test coverage missing

**Affects**: `packages/mapo-integrations-camomilla/src/runtime/server/utils/pathRewrite.ts`

**Status**: Fixed, no regression test yet

A bug caused double slashes in rewritten URLs (e.g. `/api/camomilla//users/current/`) when the path already ended with `/`. The fix is:

```ts
rewritten.replace(/([^:]\/)\/+/g, "$1");
```

**TODO**: Add unit tests for `applyPathRewrite` covering paths with and without trailing slashes, and paths with query strings.

---

## No integration between `mapo-integrations-camomilla` and Nuxt DevTools

**Status**: Not started

`@nuxt/devtools` supports custom tabs via `nuxt/devtools/kit`. `mapo-integrations-camomilla` could expose a tab showing the proxy request log, path rewrite rules, and cookie state.

**TODO (Phase 3)**: Add a DevTools integration to `mapo-integrations-camomilla`.
