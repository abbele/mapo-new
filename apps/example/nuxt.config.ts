export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "mapomodule", "mapo-integrations-camomilla"],

  css: ["~/assets/css/main.css"],

  mapoCore: {
    authLoginUrl: "/api/auth/login",
    userInfoApi: "/api/profiles/me/",
    logoutUrl: "/api/auth/logout",
  },

  camomilla: {
    server: "http://localhost:8000",
    syncCamomillaSession: false,
  },
});
