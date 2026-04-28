import { defineNuxtModule, hasNuxtModule, installModule } from "@nuxt/kit";
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
    if (!hasNuxtModule("@mapomodule/store")) {
      await installModule("@mapomodule/store");
    }

    if (!hasNuxtModule("@mapomodule/core")) {
      await installModule("@mapomodule/core", options);
    }

    // TODO: install when implemented as Nuxt modules
    // if (!hasNuxtModule('@mapomodule/form')) await installModule('@mapomodule/form')
    // if (!hasNuxtModule('@mapomodule/uikit')) await installModule('@mapomodule/uikit')
    // if (!hasNuxtModule('@mapomodule/i18n')) await installModule('@mapomodule/i18n')
    // if (!hasNuxtModule('@mapomodule/routemeta')) await installModule('@mapomodule/routemeta')
  },
}) satisfies NuxtModule<MapoOptions>;
