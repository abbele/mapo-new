import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: process.env.BASE_URL ?? '/',
  title: 'Mapo',
  description: 'Mapo v2 — Vue 3 / Nuxt 4 admin framework',
  ignoreDeadLinks: true,

  head: [
    ['meta', { name: 'theme-color', content: '#16a34a' }],
  ],

  themeConfig: {
    logo: { src: '/logo.svg', alt: 'Mapo' },

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'UIKit', link: '/uikit/' },
      { text: 'Modules', link: '/modules/core' },
      { text: 'Integrations', link: '/modules/camomilla' },
      { text: 'Migration', link: '/migration/v1-to-v2' },
    ],

    sidebar: [
      {
        text: 'Guide',
        collapsed: false,
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Feature Status', link: '/guide/feature-status' },
          { text: 'Architecture & Flows', link: '/guide/architecture-flows' },
          { text: 'Known Limitations', link: '/guide/known-limitations' },
          { text: 'Release Process', link: '/guide/release-process' },
          { text: 'Contributing', link: '/guide/contributing' },
        ],
      },
      {
        text: 'UIKit',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/uikit/' },
          { text: 'Theming', link: '/uikit/theming' },
          { text: 'MapoOverride System', link: '/uikit/mapoverride' },
          { text: 'Layout', link: '/uikit/layout' },
          { text: 'Sidebar', link: '/uikit/sidebar' },
          { text: 'Topbar', link: '/uikit/topbar' },
          { text: 'Login', link: '/uikit/login' },
          { text: 'Feedback (Snack & Confirm)', link: '/uikit/feedback' },
        ],
      },
      {
        text: 'Modules',
        collapsed: false,
        items: [
          { text: 'Core', link: '/modules/core' },
          { text: 'Store', link: '/modules/store' },
          { text: 'Utils', link: '/modules/utils' },
        ],
      },
      {
        text: 'Backend Integrations',
        collapsed: false,
        items: [
          { text: 'Camomilla CMS', link: '/modules/camomilla' },
          { text: 'Writing your own', link: '/modules/integrations-howto' },
        ],
      },
      {
        text: 'Migration',
        collapsed: false,
        items: [
          { text: 'v1 → v2', link: '/migration/v1-to-v2' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/lotrekagency/mapo' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Lotrek Agency',
    },

    search: {
      provider: 'local',
    },
  },
})
