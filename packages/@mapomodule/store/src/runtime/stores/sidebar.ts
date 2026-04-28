import { defineStore } from "pinia";
import { useCookie } from "nuxt/app";
import { SidebarCookieEnum } from "../types";

export const useSidebarStore = defineStore("mapo-sidebar", {
  state: () => ({
    drawer: true,
    mini: false,
    clipped: false,
  }),

  actions: {
    // Called from the server-only init plugin (plugins/01.init.server.ts in mapomodule)
    hydrateFromCookies() {
      const drawer = useCookie(SidebarCookieEnum.Drawer);
      const mini = useCookie(SidebarCookieEnum.Mini);
      const clipped = useCookie(SidebarCookieEnum.Clipped);
      if (drawer.value != null) this.drawer = drawer.value !== "0";
      if (mini.value != null) this.mini = mini.value === "1";
      if (clipped.value != null) this.clipped = clipped.value === "1";
    },

    toggleDrawer() {
      this.drawer = !this.drawer;
      useCookie(SidebarCookieEnum.Drawer).value = this.drawer ? "1" : "0";
    },

    toggleMini() {
      this.mini = !this.mini;
      useCookie(SidebarCookieEnum.Mini).value = this.mini ? "1" : "0";
    },

    toggleClipped() {
      this.clipped = !this.clipped;
      useCookie(SidebarCookieEnum.Clipped).value = this.clipped ? "1" : "0";
    },
  },
});
