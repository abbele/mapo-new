import {
  defineNuxtRouteMiddleware,
  navigateTo,
  useRuntimeConfig,
} from "nuxt/app";
import { useAuthStore } from "@mapomodule/store/runtime/stores/auth";
import { MAPO_DEFAULTS } from "../../types";
import type { MapoOptions } from "../../types";

export default defineNuxtRouteMiddleware((to) => {
  const rc = useRuntimeConfig().public.mapoCore as Required<MapoOptions>;
  const loginUrl = rc.loginUrl ?? MAPO_DEFAULTS.loginUrl;
  const auth = useAuthStore();
  if (!auth.isAuthenticated) {
    return navigateTo(
      `${loginUrl}?redirect=${encodeURIComponent(to.fullPath)}`,
    );
  }
});
