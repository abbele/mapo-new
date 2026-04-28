import {
  defineNuxtRouteMiddleware,
  navigateTo,
  useRuntimeConfig,
} from "nuxt/app";
import { useAuthStore } from "@mapomodule/store/runtime/stores/auth";

export default defineNuxtRouteMiddleware((to) => {
  const loginUrl = (useRuntimeConfig().public.mapoCore as { loginUrl: string })
    .loginUrl;
  const auth = useAuthStore();
  if (!auth.isAuthenticated) {
    return navigateTo(
      `${loginUrl}?redirect=${encodeURIComponent(to.fullPath)}`,
    );
  }
});
