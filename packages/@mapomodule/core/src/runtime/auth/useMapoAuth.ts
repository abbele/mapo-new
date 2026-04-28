import { useNuxtApp, navigateTo, useCookie, useRuntimeConfig } from "nuxt/app";
import { useAuthStore } from "@mapomodule/store/runtime/stores/auth";
import { CoreCookieEnum } from "../types";
import type { Credentials } from "../types";
import type { MapoOptions } from "../../types";
import { MAPO_DEFAULTS } from "../../types";

export function useMapoAuth(
  options?: Pick<MapoOptions, "authLoginUrl" | "userInfoApi" | "logoutUrl">,
) {
  const runtimeConfig = useRuntimeConfig().public
    .mapoCore as Required<MapoOptions>;
  const authLoginUrl =
    options?.authLoginUrl ??
    runtimeConfig.authLoginUrl ??
    MAPO_DEFAULTS.authLoginUrl;
  const userInfoApi =
    options?.userInfoApi ??
    runtimeConfig.userInfoApi ??
    MAPO_DEFAULTS.userInfoApi;
  const logoutUrl =
    options?.logoutUrl ?? runtimeConfig.logoutUrl ?? MAPO_DEFAULTS.logoutUrl;
  const loginUrl = runtimeConfig.loginUrl ?? MAPO_DEFAULTS.loginUrl;

  const { $mapoFetch } = useNuxtApp();
  const authStore = useAuthStore();

  async function fetchUser(): Promise<void> {
    const user = await $mapoFetch(userInfoApi, { method: "GET" });
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
      await $mapoFetch(logoutUrl, { method: "POST" });
    } finally {
      useCookie(CoreCookieEnum.Session).value = null;
      authStore.reset();
      await navigateTo(loginUrl);
    }
  }

  return { login, logout, fetchUser };
}
