import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // NOTE: deliberately NOT using `mapomodule` (the meta-module) nor
  // `@mapomodule/uikit` / `@nuxt/ui`. We pull only:
  //   - @mapomodule/core              → useMapoAuth, useCrud, $mapoFetch
  //   - @mapomodule/form              → headless form engine + registry
  //   - mapo-integrations-camomilla   → Nitro proxy / cookie sync
  // The UI is 100% Vuetify 3. This is the headless test.
  modules: [
    "@mapomodule/core",
    "@mapomodule/form",
    "mapo-integrations-camomilla",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        config.plugins = config.plugins || [];
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
  ],

  mapo: {
    authLoginUrl: "/api/auth/login",
    userInfoApi: "/api/profiles/me/",
    logoutUrl: "/api/auth/logout",
  },

  camomilla: {
    server: "http://localhost:8000",
    syncCamomillaSession: false,
  },

  css: ["vuetify/styles", "@mdi/font/css/materialdesignicons.css"],

  vue: { template: { transformAssetUrls } },

  build: {
    transpile: ["vuetify"],
  },
});
