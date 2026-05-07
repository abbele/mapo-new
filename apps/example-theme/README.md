# @mapomodule/example-theme

Theming and component override demo app for Mapo v2. No backend required.

## Run

From the monorepo root:

```bash
pnpm install
pnpm dev:example-theme   # http://localhost:3001
```

## What's demonstrated

| Page              | Customization type                                                                  |
| ----------------- | ----------------------------------------------------------------------------------- |
| `/`               | Overview — links to all sections                                                    |
| `/css-tokens`     | CSS token overrides via `mapo.uikit.css` — primary palette, semantic tokens, radius |
| `/nuxt-ui-config` | Global component defaults via `mapo.uikit.ui` in `nuxt.config.ts`                   |
| `/mapoverride`    | Full component replacement via `app/mapooverride/` — `MapoTopbar`, `MapoLogin`      |
| `/slots`          | Layout slot API — `sidebar:logo`, `topbar:right`, etc.                              |
| `/dark-mode`      | Semantic token behavior in dark and light mode                                      |

## Customization layers in this app

| File                                                                 | What it configures                                                   |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`nuxt.config.ts`](nuxt.config.ts)                                   | `mapo.uikit.css` + `mapo.uikit.ui` component defaults                |
| [`app/assets/css/theme.css`](app/assets/css/theme.css)               | Primary color (violet), semantic tokens, radius, dark mode overrides |
| [`app/mapooverride/MapoTopbar.vue`](app/mapooverride/MapoTopbar.vue) | Custom topbar with gradient + dark mode toggle                       |
| [`app/mapooverride/MapoLogin.vue`](app/mapooverride/MapoLogin.vue)   | Fully custom login page using `useMapoAuth`                          |

## See also

- [`apps/example/`](../example/) — core feature demo (requires backend)
- [docs/uikit/theming.md](../../docs/uikit/theming.md) — full theming reference
