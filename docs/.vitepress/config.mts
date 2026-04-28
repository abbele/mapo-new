import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Mapo',
  description: 'Mapo v2 — Vue 3 / Nuxt 4 admin framework',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Modules', link: '/modules/core' },
      { text: 'Integrations', link: '/modules/camomilla' },
      { text: 'Components', link: '/components/' },
      { text: 'Migration', link: '/migration/v1-to-v2' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'Architecture & Flows', link: '/guide/architecture-flows' },
          { text: 'Known Limitations', link: '/guide/known-limitations' },
          { text: 'Release Process', link: '/guide/release-process' },
          { text: 'Contributing', link: '/guide/contributing' },
        ],
      },
      {
        text: 'Modules',
        items: [
          { text: 'Core', link: '/modules/core' },
          { text: 'Store', link: '/modules/store' },
          { text: 'Form', link: '/modules/form' },
          { text: 'UI Kit', link: '/modules/uikit' },
          { text: 'i18n', link: '/modules/i18n' },
          { text: 'Utils', link: '/modules/utils' },
        ],
      },
      {
        text: 'Backend Integrations',
        items: [
          { text: 'Camomilla CMS', link: '/modules/camomilla' },
          { text: 'Writing your own', link: '/modules/integrations-howto' },
        ],
      },
      {
        text: 'Components',
        items: [
          { text: 'Overview', link: '/components/' },
        ],
      },
      {
        text: 'Override System',
        items: [
          { text: 'How it works', link: '/override-system' },
        ],
      },
      {
        text: 'Migration',
        items: [
          { text: 'v1 → v2', link: '/migration/v1-to-v2' },
          { text: 'Codemod', link: '/migration/codemod' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Auto-generated', link: '/api/' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/lotrekagency/mapo' },
    ],
  },
})
