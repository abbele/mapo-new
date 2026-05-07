import {
  createResolver,
  defineNuxtModule,
  hasNuxtModule,
  installModule,
} from "@nuxt/kit";
import type { NuxtModule } from "@nuxt/schema";
import type { MapoOptions } from "@mapomodule/core";

// Meta-module: installs all @mapomodule/* Nuxt modules with a single registration.
// Add this to nuxt.config modules[] and configure everything under the `mapo` key.
export default defineNuxtModule<MapoOptions>({
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
        options,
      );
    }

    // TODO: install when implemented as Nuxt modules
    // if (!hasNuxtModule('@mapomodule/form')) await installModule(await resolver.resolvePath('@mapomodule/form'))
    // if (!hasNuxtModule('@mapomodule/uikit')) await installModule(await resolver.resolvePath('@mapomodule/uikit'))
    // if (!hasNuxtModule('@mapomodule/i18n')) await installModule(await resolver.resolvePath('@mapomodule/i18n'))
    // if (!hasNuxtModule('@mapomodule/routemeta')) await installModule(await resolver.resolvePath('@mapomodule/routemeta'))
  },
}) satisfies NuxtModule<MapoOptions>;
