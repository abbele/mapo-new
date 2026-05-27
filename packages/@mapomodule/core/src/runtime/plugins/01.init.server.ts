import {
  defineNuxtPlugin,
  useRuntimeConfig,
  useCookie,
  useRequestHeaders,
  useRequestURL,
} from "nuxt/app";
import { setActivePinia } from "pinia";
import type { Pinia } from "pinia";
import { useAuthStore } from "@mapomodule/store/runtime/stores/auth";
import { useSidebarStore } from "@mapomodule/store/runtime/stores/sidebar";
import type { MapoUser } from "@mapomodule/store/runtime/types";
import { CoreCookieEnum } from "../types";

export default defineNuxtPlugin({
  name: "mapo-core:init",
  async setup(nuxtApp) {
    const runtimeConfig = useRuntimeConfig().public.mapoCore as
      | Record<string, string>
      | undefined;
    const userInfoApi = runtimeConfig?.userInfoApi ?? "/api/profiles/me/";

    const pinia = nuxtApp.$pinia as Pinia;
    setActivePinia(pinia);
    const authStore = useAuthStore(pinia);
    const sidebarStore = useSidebarStore(pinia);

    sidebarStore.hydrateFromCookies();

    // The session cookie is HttpOnly — readable on SSR but not on the client.
    // If present, hydrate the auth store by fetching the user with the
    // incoming Cookie header forwarded to the proxy middleware.
    const sessionCookie = useCookie(CoreCookieEnum.Session);
    if (!sessionCookie.value) return;

    try {
      const headers = useRequestHeaders(["cookie"]);
      const url = useRequestURL();
      const absolute = `${url.protocol}//${url.host}${userInfoApi}`;
      const user = await (
        nuxtApp.$mapoFetch as (url: string, opts: object) => Promise<unknown>
      )(absolute, { method: "GET", headers });
      authStore.setUser(user as MapoUser);
    } catch (e) {
      console.error(`[mapo] Cannot restore session from cookie:\n${e}`);
      authStore.reset();
      sessionCookie.value = null;
    }
  },
});
