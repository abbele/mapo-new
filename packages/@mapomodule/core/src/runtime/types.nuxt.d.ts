import type { $Fetch } from "ofetch";

declare module "nuxt/app" {
  interface NuxtApp {
    $mapoFetch: $Fetch;
  }
}

declare module "vue-router" {
  interface RouteMeta {
    permissions?: { model: string } | string[];
    roles?: string[];
    /** Route middleware names applied to this route. Read by useCanAccessRoute for sidebar visibility. */
    middleware?: string | string[];
  }
}

export {};
