import { defineNuxtRouteMiddleware, createError } from "nuxt/app";
import { useAuthStore } from "@mapomodule/store/runtime/stores/auth";

type RoutePermissions = { model: string } | string[];

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  const perms = to.meta.permissions as RoutePermissions | undefined;
  if (!perms) return;
  if (auth.info?.is_superuser) {
    if (!Array.isArray(perms)) {
      auth.pagePermissions[String(to.name)] = [
        "view",
        "add",
        "change",
        "delete",
      ];
    }
    return;
  }

  if (Array.isArray(perms)) {
    if (!perms.every((p) => auth.rawPermissions.includes(p)))
      throw createError({ statusCode: 403, message: "Forbidden" });
  } else {
    const actions = auth.rawPermissions
      .filter((p) => p.endsWith(`_${perms.model}`))
      .map((p) => p.replace(`_${perms.model}`, ""));

    if (!actions.includes("view"))
      throw createError({ statusCode: 403, message: "Forbidden" });

    auth.pagePermissions[String(to.name)] = actions;
  }
});
