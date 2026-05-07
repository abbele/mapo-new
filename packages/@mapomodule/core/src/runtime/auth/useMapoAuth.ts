import { useNuxtApp, navigateTo, useCookie, useRuntimeConfig } from "nuxt/app";
import { useAuthStore } from "@mapomodule/store/runtime/stores/auth";
import { CoreCookieEnum } from "../types";
import type { Credentials } from "../types";

type AuthOverrides = {
  authLoginUrl?: string;
  userInfoApi?: string;
  logoutUrl?: string;
};

export function useMapoAuth(options?: AuthOverrides) {
  const rc = useRuntimeConfig().public.mapoCore as Record<string, string>;
  const authLoginUrl = options?.authLoginUrl ?? rc.authLoginUrl;
  const userInfoApi = options?.userInfoApi ?? rc.userInfoApi;
  const logoutUrl = options?.logoutUrl ?? rc.logoutUrl;
  const loginUrl = rc.loginUrl;

  const { $mapoFetch } = useNuxtApp() as ReturnType<typeof useNuxtApp> & {
    $mapoFetch: typeof $fetch;
  };
  const authStore = useAuthStore();

  async function fetchUser(): Promise<void> {
    const user = await $mapoFetch<
      import("@mapomodule/store/runtime/types").MapoUser
    >(userInfoApi, { method: "GET" });
    authStore.setUser(user);
  }

  async function login(credentials: Credentials): Promise<void> {
    // The backend sets the session cookie (HttpOnly) on a successful login.
    // We confirm the session by fetching the user — if it succeeds, the
    // store is hydrated and isAuthenticated becomes true.
    await $mapoFetch(authLoginUrl, { method: "POST", body: credentials });
    await fetchUser();
  }

  async function logout(): Promise<void> {
    try {
      await $mapoFetch(logoutUrl, { method: "GET" });
    } finally {
      useCookie(CoreCookieEnum.Session).value = null;
      authStore.reset();
      await navigateTo(loginUrl);
    }
  }

  return { login, logout, fetchUser };
}
