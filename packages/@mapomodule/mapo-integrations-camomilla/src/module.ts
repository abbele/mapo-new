import { defineNuxtModule, addServerHandler, createResolver } from "@nuxt/kit";
import type { NuxtModule } from "@nuxt/schema";
import type { CamomillaOptions } from "./types";

export type { CamomillaOptions } from "./types";

export default defineNuxtModule<CamomillaOptions>({
  meta: {
    name: "mapo-integrations-camomilla",
    configKey: "camomilla",
  },

  defaults: {
    server: "http://localhost:8000",
    base: "",
    syncCamomillaSession: false,
    forwardedHeaders: [],
    pathRewrite: {},
    changeOrigin: true,
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Expose config server-side only (contains backend URL — not public)
    nuxt.options.runtimeConfig.camomilla = {
      server: options.server,
      base: options.base ?? "",
      syncCamomillaSession: options.syncCamomillaSession ?? false,
      forwardedHeaders: options.forwardedHeaders ?? [],
      pathRewrite: options.pathRewrite ?? {},
      changeOrigin: options.changeOrigin ?? true,
    };

    // Server middleware: intercepts /api/* and proxies to Camomilla
    addServerHandler({
      middleware: true,
      handler: resolver.resolve("./runtime/server/middleware/proxy"),
    });
  },
}) satisfies NuxtModule<CamomillaOptions>;
