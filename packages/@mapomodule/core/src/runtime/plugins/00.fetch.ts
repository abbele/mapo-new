import {
  defineNuxtPlugin,
  navigateTo,
  useRoute,
  useRuntimeConfig,
} from "nuxt/app";
import { useAuthStore } from "@mapomodule/store/runtime/stores/auth";
import { useSnackStore } from "@mapomodule/store/runtime/stores/snack";
import { MAPO_DEFAULTS } from "../../types";
import type { MapoOptions } from "../../types";

export default defineNuxtPlugin({
  name: "mapo-core:fetch",
  enforce: "pre",
  setup() {
    const rc = useRuntimeConfig().public.mapoCore as Required<MapoOptions>;
    const logoutUrl = rc.logoutUrl ?? MAPO_DEFAULTS.logoutUrl;
    const loginUrl = rc.loginUrl ?? MAPO_DEFAULTS.loginUrl;

    const handle = (status: number, requestUrl: string) => {
      if (status === 401 && !requestUrl.includes(logoutUrl)) {
        const auth = useAuthStore();
        auth.reset();
        if (import.meta.client) {
          const route = useRoute();
          navigateTo(
            `${loginUrl}?redirect=${encodeURIComponent(route.fullPath)}`,
          );
        }
      }
      if (status === 403) {
        useSnackStore().show("Permission denied", "error");
      }
    };

    const mapoFetch = $fetch.create({
      onResponse({ response, request }) {
        handle(response.status, String(request));
      },
      onResponseError({ response, request, error }) {
        handle(response?.status ?? 0, String(request));
        return Promise.reject(error);
      },
    });

    return {
      provide: { mapoFetch },
    };
  },
});
