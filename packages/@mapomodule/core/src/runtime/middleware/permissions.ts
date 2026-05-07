import { defineNuxtRouteMiddleware, createError } from "nuxt/app";
import { useAuthStore } from "@mapomodule/store/runtime/stores/auth";

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  const required = to.meta.permissions as string[] | undefined;
  if (!required?.length) return;
  if (auth.info?.is_superuser) return;
  const satisfied = required.every((p) => auth.rawPermissions.includes(p));
  if (!satisfied) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
});
