import {
  createResolver,
  defineNuxtModule,
  hasNuxtModule,
  installModule,
} from "@nuxt/kit";
import type { NuxtModule } from "@nuxt/schema";
import type { MapoOptions } from "@mapomodule/core";
import type { MapoUikitOptions } from "@mapomodule/uikit";

interface MapoModuleOptions extends MapoOptions {
  /** Options forwarded to @mapomodule/uikit (CSS override, Nuxt UI defaults). */
  uikit?: MapoUikitOptions;
}

// Meta-module: installs all @mapomodule/* Nuxt modules with a single registration.
// Add this to nuxt.config modules[] and configure everything under the `mapo` key.
export default defineNuxtModule<MapoModuleOptions>({
  meta: {
    name: "mapomodule",
    configKey: "mapo",
  },

  async setup(options, _nuxt) {
    // Resolve paths from mapomodule's own node_modules so pnpm strict mode
    // doesn't require the consuming app to declare each @mapomodule/* directly.
    const resolver = createResolver(import.meta.url);

    if (!hasNuxtModule("@mapomodule/store")) {
      await installModule(await resolver.resolvePath("@mapomodule/store"));
    }

    if (!hasNuxtModule("@mapomodule/core")) {
      await installModule(
        await resolver.resolvePath("@mapomodule/core"),
        options as MapoOptions,
      );
    }

    if (!hasNuxtModule("@mapomodule/uikit")) {
      await installModule(
        await resolver.resolvePath("@mapomodule/uikit"),
        options.uikit ?? {},
      );
    }

    // TODO: install when implemented as Nuxt modules
    // if (!hasNuxtModule('@mapomodule/form')) await installModule(await resolver.resolvePath('@mapomodule/form'))
    // if (!hasNuxtModule('@mapomodule/i18n')) await installModule(await resolver.resolvePath('@mapomodule/i18n'))
  },
}) satisfies NuxtModule<MapoModuleOptions>;
