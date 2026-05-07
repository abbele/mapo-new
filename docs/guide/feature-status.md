# Feature Status

Current implementation status of all Mapo v2 features relative to the legacy v1 feature set.

## Implemented ✅

### Core & Auth

| Feature                                      | Notes                                                                                                                                                                                                                                                                   |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useMapoAuth()` — login / logout / fetchUser | HttpOnly cookie session, no client-stored token                                                                                                                                                                                                                         |
| SSR session hydration                        | Server plugin reads session cookie, hydrates `useAuthStore` before first render                                                                                                                                                                                         |
| `auth` middleware                            | Redirects to `loginUrl` if not authenticated; appends `?redirect=`                                                                                                                                                                                                      |
| `permissions` middleware                     | Supports `{ model }` (derives CRUD actions, populates `pagePermissions`) and `string[]` (explicit codenames)                                                                                                                                                            |
| `roles` middleware                           | Checks `meta.roles` against `useAuthStore.role`                                                                                                                                                                                                                         |
| 401 auto-logout                              | `$mapoFetch` interceptor calls `auth.reset()` and redirects on 401                                                                                                                                                                                                      |
| `useCrud<T>()` — full CRUD repository        | `list`, `detail`, `create`, `update`, `partialUpdate`, `delete`, `updateOrder`                                                                                                                                                                                          |
| Multipart upload with policy                 | `auto` \| `force` \| `disable` — transforms payload when files are detected                                                                                                                                                                                             |
| `@mapomodule/utils` — base helpers           | `deepMerge`, `deepClone`, `objectDiff`, `getNestedValue`, `setNestedValue`, `formatDate`, `debounce`, `normalizeEndpoint`, `slotNamespace`, `buildRouteTree`, `calcMaxMenuNestDepth`, `isFile`, `isBlob`, `isFileOrBlob`, `findPropPaths`, `filesInObject`, `filterObj` |

### State (Pinia)

| Store             | Key features                                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useAuthStore`    | `isAuthenticated`, `username`, `role`, `modelPermissions`, `pagePermissions` (populated by `permissions` middleware when using `{ model }` format) |
| `useSnackStore`   | `show(message, type, duration)`, `dismiss()`                                                                                                       |
| `useConfirmStore` | `ask(options): Promise<boolean>`                                                                                                                   |
| `useSidebarStore` | `drawer`, `mini`, `clipped` — all persisted to cookies, SSR-hydrated                                                                               |
| `usePermissions`  | `userCan(model, action)` helper                                                                                                                    |

### UIKit Shell

| Component / Feature        | Notes                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `mapo-default` layout      | Sidebar + Topbar + content + global feedback                                                                                         |
| `MapoSidebar`              | Drawer + mini mode, cookie-persisted state, full slot API                                                                            |
| Auto-generated sidebar nav | Built from `route.meta.label` — no manual config needed                                                                              |
| Nested menu                | `meta.parent` creates hierarchical groups                                                                                            |
| Footer items               | `meta.sidebarFooter: true` moves item to sidebar footer                                                                              |
| `MapoTopbar`               | Drawer toggle + left / center / right slots                                                                                          |
| `MapoLogin`                | Split-panel form, field-level error mapping (backend 400 `{username,password}`), redirect-aware, slots: `brand` / `panel` / `footer` |
| `MapoSnackBar`             | Bridges `useSnackStore` to Nuxt UI toast notifications                                                                               |
| `MapoConfirmDialog`        | Bridges `useConfirmStore` to non-dismissible `<UModal>`                                                                              |
| `MapoRootComponents`       | Mounts SnackBar + ConfirmDialog globally                                                                                             |
| `MapoThemeToggle`          | Dark/light toggle via `useColorMode()` — drop-in for any slot                                                                        |
| Theming via CSS            | Custom CSS file injected after base via `uikit.css` option                                                                           |
| Nuxt UI defaults override  | Component config via `uikit.ui` option                                                                                               |
| Component override system  | Place `MapoXxx.vue` in `app/mapooverride/` to swap any component at build time                                                       |

### Integrations

| Feature                       | Notes                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| `mapo-integrations-camomilla` | Nitro proxy, path rewriting, cookie sync (`sessionid` ↔ `__mapo_session`), CSRF forwarding |
| Custom backend integration    | Pattern documented in [Writing your own](/modules/integrations-howto)                      |

---

## Not yet implemented 🔲

These features existed in Mapo v1 and are planned for v2 but have not been built yet.

### List Engine

Paginated, filterable, sortable data table.

**v1 had:** `MapoList` with `ListTable`, `ListFilters`, `ListActions`, `ListQuickEdit` sub-components. Server-side pagination, search, select-all across pages, bulk actions, drag-reorder, slot namespacing on every region.

**v2 target:** Rewritten as a typed, headless-optional composable (`useList`) + `MapoList` component built on Nuxt UI's `UTable`. See roadmap Phase 4.

### Detail / Form Engine

Record creation and editing with declarative field configuration.

**v1 had:** `MapoDetail` with `Form` + `FormField`, declarative `fields` config, `usePatch` differential saves, multilingual field sync, unsaved-changes guard, responsive main + sidebar layout.

**v2 target:** Typed `fields` config (replaces `defaults.js`), JSON Schema optional, built on Nuxt UI form primitives. See roadmap Phase 3–4.

### Media Manager

File upload, gallery browsing, and media picker dialog.

**v1 had:** Gallery with pagination and single/multi selection, folder navigation, drag-and-drop uploader, metadata editor with i18n, bulk delete, `MediaManagerDialog` picker embeddable in form fields.

**v2 target:** Full rewrite as a Nuxt module (`@mapomodule/media`). See roadmap Phase 6.

### Menu Manager

Drag-and-drop reordering of navigation items for end users.

**v1 had:** `MapoMenuManager` with tree-drag via `vue-draggable`, nested items up to 2 levels, live preview of menu structure.

**v2 target:** Phase 7, using `vue-draggable-plus`.

### i18n

Multi-language content switching and UI translation.

**v1 had:** `@nuxtjs/i18n` integration, per-field language switching in Detail, `DetailLangSwitch`, translation sync helpers, base locale files overridable by the consuming app.

**v2 target:** `@mapomodule/i18n` module using `@nuxtjs/i18n` v9. See roadmap Phase 7.

### Component Override System ✅

Replacing any Mapo component with a custom one via naming convention.

**v1 had:** `Mapoverride{ComponentName}` naming resolves automatically at `components:extend` build time.

**v2 implementation:** Place a `.vue` file named like any Mapo component (e.g. `MapoTopbar.vue`) inside `app/mapooverride/` in the consuming app. The `@mapomodule/uikit` module hooks into Nuxt's `components:extend` at build time and replaces the default component's `filePath` with the override. Convention: `MapoOverride` prefix is **not** used in v2 — the file must match the exact component name (e.g. `MapoTopbar.vue` overrides `MapoTopbar`, not `MapoOverrideTopbar.vue`).

### Theme Toggle (Dark / Light) ✅

**v1 had:** `ThemeToggle.vue` in the sidebar header.

**v2 implementation:** `MapoThemeToggle` — a `UButton` toggling `useColorMode().preference`. Drop it anywhere (topbar slot, sidebar, etc.).

### Standalone UIKit components (planned — Phase 7)

| Component             | Description                                                          |
| --------------------- | -------------------------------------------------------------------- |
| `MapoLogoutButton` 🔲 | Reusable logout button wrapping `useMapoAuth().logout()`             |
| `MapoLangSwitcher` 🔲 | UI language selector (standalone, separate from full i18n)           |
| `MapoDropArea` 🔲     | Generic drag-and-drop zone — shared by Form fields and Media Manager |
| `MapoPagePreview` 🔲  | Page/template preview panel                                          |

### Form Fields Library (`@mapomodule/form` — Phase 5)

| Field                                                      | Notes                                                    |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| `MapoDateField` / `MapoDateTimeField` / `MapoTimeField` 🔲 | Nuxt UI `<UInputDate>` / `<UInputTime>` wrappers         |
| `MapoColorField` 🔲                                        | Color picker                                             |
| `MapoFileField` 🔲                                         | File upload via `MapoDropArea`                           |
| `MapoFksField` 🔲                                          | Foreign key select with server-side search via `useCrud` |
| `MapoMapField` 🔲                                          | Leaflet map picker (lazy-load, `<ClientOnly>`)           |
| `MapoRepeater` 🔲                                          | Repeatable field group (array of sub-objects)            |
| `MapoSeoPreview` 🔲                                        | Google SERP preview mock                                 |
| `MapoWygEditor` 🔲                                         | Rich text editor — Tiptap v2 (decided in DP-3)           |
| `MapoMediaField` / `MapoEnhancedMediaField` 🔲             | Media picker integrating `MapoMediaManagerDialog`        |

### `usePatch<T>` composable (Phase 3)

Differential PATCH helper: wraps `useCrud.partialUpdate` with automatic `objectDiff` to send only changed fields. `objectDiff` is already in `@mapomodule/utils`.

### `useMediaStore` (Phase 6)

Pinia store for Media Manager state: gallery items, folders, pagination, selection, edit mode.

---

## Removed from v2 (intentional)

| v1 feature                                | Reason removed                                                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `@mapomodule/routemeta` package           | `definePageMeta()` in Nuxt 4 natively supports arbitrary meta fields. No parser needed.                                     |
| `@mapomodule/integrations` adapter loader | In Nuxt 4, each integration is a standalone Nuxt module. A central loader is unnecessary abstraction.                       |
| `$mapo` global facade                     | Replaced by individual composables (`useMapoAuth`, `useCrud`, `useSnackStore`, etc.) — tree-shakable and TypeScript-native. |
| Axios                                     | Replaced by Nuxt's native `$fetch` / `ofetch`.                                                                              |
| Vuex                                      | Replaced by Pinia.                                                                                                          |
| `setToken` / client-stored JWT            | Sessions are HttpOnly cookies. No token ever reaches client JS.                                                             |
