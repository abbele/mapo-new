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

### List Engine ✅

Paginated, filterable, sortable data table.

**v2 implementation** (`@mapomodule/uikit`):

- `<MapoList>` shell composing `<MapoListHead>`, `<MapoListFilters>`, `<MapoListActions>`, `<MapoListTabs>`, `<MapoListTable>`, `<MapoListQuickEdit>`
- Server-side pagination, search, ordering — filters are passed as request params (no query-string concatenation)
- Row selection keyed by primary key (`lookup`) — paging or sorting does not move selections
- Drag reorder uses `crud.updateOrder` (one server call, no parallel `PATCH` storm)
- Quick-edit modal driven by the same `FieldDescriptor[]` as `<MapoDetail>` — no bespoke dialog code
- Column slots: `cell.<key>`, `head.<key>`, `expand.<key>`; tabbed status filter via `meta.tabs`

### Detail / Form Engine ✅

Record creation and editing with declarative field configuration.

**v1 had:** `MapoDetail` with `Form` + `FormField`, declarative `fields` config, `usePatch` differential saves, multilingual field sync, unsaved-changes guard, responsive main + sidebar layout.

**v2 — form engine** (`@mapomodule/form`):

- `FieldDescriptor<T>` TS-strict discriminated union; `FieldRegistry` (mapping/attrs/accessor) configurable via `nuxt.config.mapoForm`
- `defineFormField(type, entry, opts)` typed helper for registering custom field components with collision detection
- `<MapoForm>` and `<MapoDetail>` auto-inject the global `$mapoFormRegistry` — the `:registry` prop is optional
- `useMapoForm()` headless composable: dirty state, diff/patch, `validateClient`, per-field debounce, i18n (`translatable` + `synci18n` + automatic `initLang`)
- `<MapoForm>`, `<MapoFormField>`, `<MapoFormGroup>` (expanded by config), `<MapoFormTabs>` (per-tab error badge), `<MapoUnknownField>` (fail-soft fallback)
- Full slot system: `field.<key>`, `field.<key>.label`, `.append`, `.prepend`, `.hint`, `.before`, `.after`
- Field library: every base type via NUI direct mapping plus `MapoDateField`, `MapoTimeField`, `MapoDateTimeField` (with `tz: 'naive' \| 'utc'` strategy), `MapoFksField` (debounced remote autocomplete), `MapoRepeater` (drag-and-drop, undo, templates, contextual mini-card collapse, focus mode), `MapoSeoPreview` (live SERP), `MapoWygEditor` (Tiptap v2 with safe `Link` validator and HTML sanitizer), `MapoMapField` (Leaflet SSR-safe via dynamic import)
- `useFormFromSchema(schema, options)`: generates `FieldDescriptor[]` from JSON Schema (Pydantic / DRF), with `if/then/else` → `visible()`, plus `exclude` and `overrides`. Cycle-safe `$ref` resolution.

**v2 — MapoDetail** (`@mapomodule/uikit`):

- `<MapoDetail>` shell: two-column layout (main + sticky sidebar), CRUD lifecycle (fetch/save/delete) through `useCrud`, differential PATCH, unsaved-changes guard (`onBeforeRouteLeave` + `window.beforeunload`), 400 error handling with field-level errors, integrated snack/confirm
- `<MapoDetailLangSwitch>`: language tabs with per-language error badge, syncs the `?lang=` query param
- Slots: `title`, `body`, `body.lang`, `body.top`, `body.bottom`, `side.buttons`, `side.top`, `side.bottom`, `button.save`, `button.savecontinue`, `button.back`, `button.delete`
- Every slot receives `{ model, errors, currentLang, isNew, isLoading, isSaving, isDeleting, isDirty, save, deleteItem, back }`

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

### Form Fields Library (`@mapomodule/form`)

| Field                                                               | Status | Notes                                                                                                                    |
| ------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| text / textarea / number / boolean / switch / color / file / slider | ✅     | NUI direct mapping — no Mapo wrapper needed                                                                              |
| select                                                              | ✅     | `USelectMenu` with `value-key` / `label-key` via registry                                                                |
| `MapoDateField` / `MapoTimeField` / `MapoDateTimeField`             | ✅     | ISO ↔ `@internationalized/date`; `datetime` accepts `tz: 'naive' \| 'utc'`                                               |
| `MapoFksField` (fks / m2m)                                          | ✅     | `USelectMenu` + debounced remote fetch, removable M2M chips                                                              |
| `MapoRepeater`                                                      | ✅     | Drag-and-drop (`vue-draggable-plus`), stable item UIDs, undo stack, templates, contextual mini-card collapse, focus mode |
| `MapoSeoPreview`                                                    | ✅     | 60 / 155 char counters, live SERP preview                                                                                |
| `MapoWygEditor`                                                     | ✅     | Tiptap v2, custom toolbar, safe `Link` validator + HTML sanitizer, extensions via `attrs.extensions`                     |
| `MapoMapField`                                                      | ✅     | Leaflet SSR-safe via `ClientOnly` + dynamic import                                                                       |
| `MapoMediaField` / `MapoEnhancedMediaField`                         | 🔲     | Depends on Phase 6 (Media Manager)                                                                                       |

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
