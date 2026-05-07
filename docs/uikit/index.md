# UIKit

`@mapomodule/uikit` is the visual layer of Mapo. It provides:

- A **default admin layout** (`mapo-default`) with sidebar, topbar, and global feedback components
- **Auto-generated sidebar navigation** driven by route metadata — no manual menu config
- **Authentication UI** (`MapoLogin`) with redirect and error handling
- **Global feedback** (`MapoSnackBar`, `MapoConfirmDialog`) that any page can trigger via stores
- **Full Tailwind v4 + Nuxt UI theming** with CSS overrides and Nuxt UI component defaults

## What's included

| Component             | Auto-imported | Description                                     |
| --------------------- | ------------- | ----------------------------------------------- |
| `MapoSidebar`         | ✅            | Collapsible sidebar with drawer + mini modes    |
| `MapoSidebarList`     | ✅            | Route-driven menu list, supports footer         |
| `MapoSidebarListItem` | ✅            | Recursive menu item with submenu support        |
| `MapoTopbar`          | ✅            | Top navigation bar with slot for custom content |
| `MapoLogin`           | ✅            | Sign-in form with redirect and error state      |
| `MapoSnackBar`        | ✅            | Toast notification bridge to `useSnackStore`    |
| `MapoConfirmDialog`   | ✅            | Modal confirm bridge to `useConfirmStore`       |
| `MapoRootComponents`  | ✅            | Wrapper that mounts SnackBar + ConfirmDialog    |

**Layout** registered via Nuxt layouts:

| Layout         | Key                                               |
| -------------- | ------------------------------------------------- |
| `mapo-default` | Full admin shell: sidebar + topbar + content area |

## Setup

`@mapomodule/uikit` is installed automatically by the `mapomodule` meta-package. `@nuxt/ui` must be declared **before** `mapomodule` in `modules[]` — installing it via `installModule()` from inside a module causes an `Icon.vue` SSR infinite loop due to how `@nuxt/icon` resolves component aliases. `@iconify-json/lucide` is bundled with `mapomodule` and does not need to be installed separately.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    "@nuxt/ui", // ← must come first
    "mapomodule",
  ],
});
```

## Sections

- **[Theming](./theming)** — CSS overrides, Tailwind tokens, Nuxt UI component defaults
- **[Layout](./layout)** — `mapo-default` layout, available slots
- **[Sidebar](./sidebar)** — sidebar navigation, route meta config, nesting, mini/drawer state
- **[Topbar](./topbar)** — topbar slots and customization
- **[Login](./login)** — `MapoLogin` props, slots, redirect logic
- **[Feedback](./feedback)** — snackbar and confirm dialog how-to
