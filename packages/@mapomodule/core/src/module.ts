import {
  defineNuxtModule,
  addImports,
  addPlugin,
  addRouteMiddleware,
  hasNuxtModule,
  installModule,
  createResolver,
} from "@nuxt/kit";
import type { NuxtModule } from "@nuxt/schema";
import { MAPO_DEFAULTS } from "./types";
import type { MapoOptions } from "./types";

export type { MapoOptions } from "./types";
export type {
  ListParams,
  PaginatedResponse,
  ApiResponse,
  CrudConfig,
  CrudOptions,
  CrudRepository,
  MultipartPolicy,
  Credentials,
  AuthToken,
} from "./runtime/types";
export { MultipartPolicyEnum, CoreCookieEnum } from "./runtime/types";
export type { MapoFacade, MapoApiLayer } from "./runtime/composables/useMapo";

export default defineNuxtModule<MapoOptions>({
  meta: {
    name: "@mapomodule/core",
    configKey: "mapoCore",
  },

  defaults: MAPO_DEFAULTS,

  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    if (!hasNuxtModule("@mapomodule/store")) {
      await installModule("@mapomodule/store");
    }

    nuxt.options.runtimeConfig.public.mapoCore = {
      authLoginUrl: options.authLoginUrl,
      userInfoApi: options.userInfoApi,
      logoutUrl: options.logoutUrl,
      loginUrl: options.loginUrl,
    };

    addPlugin({ src: resolver.resolve("./runtime/plugins/00.fetch") });
    addPlugin({
      src: resolver.resolve("./runtime/plugins/01.init.server"),
      mode: "server",
    });

    addImports([
      { name: "useCrud", from: resolver.resolve("./runtime/api/crud") },
      {
        name: "useMapoAuth",
        from: resolver.resolve("./runtime/auth/useMapoAuth"),
      },
      {
        name: "useMapo",
        from: resolver.resolve("./runtime/composables/useMapo"),
      },
    ]);

    addRouteMiddleware({
      name: "auth",
      path: resolver.resolve("./runtime/middleware/auth"),
    });
    addRouteMiddleware({
      name: "permissions",
      path: resolver.resolve("./runtime/middleware/permissions"),
    });
    addRouteMiddleware({
      name: "roles",
      path: resolver.resolve("./runtime/middleware/roles"),
    });
  },
}) satisfies NuxtModule<MapoOptions>;
