import type { $Fetch } from "ofetch";

declare module "nuxt/app" {
  interface NuxtApp {
    $mapoFetch: $Fetch;
  }
}

export {};
