import { defineNuxtRouteMiddleware, createError } from "nuxt/app";
import { useAuthStore } from "@mapomodule/store/runtime/stores/auth";

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  const required = to.meta.roles as string[] | undefined;
  if (!required?.length) return;
  if (auth.info?.is_superuser) return;
  const userGroups = auth.info?.groups ?? [];
  const hasRole = required.some((r) => userGroups.includes(r));
  if (!hasRole) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
});
