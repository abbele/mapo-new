import { defineNitroPlugin } from "nitropack/runtime";
import type { CamomillaRuntimeConfig } from "../../../types";

declare module "h3" {
  interface H3EventContext {
    camomillaConfig?: CamomillaRuntimeConfig;
  }
}

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook("request", (event) => {
    // useRuntimeConfig is available at Nitro request time via the global
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event.context.camomillaConfig = (globalThis as any).__nuxt_runtime_config__
      ?.camomilla as CamomillaRuntimeConfig | undefined;
  });
});
