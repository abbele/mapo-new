import { ref, computed } from "vue";
import {
  defineNuxtPlugin,
  navigateTo,
  useRoute,
  useRuntimeConfig,
} from "nuxt/app";
import { useAuthStore } from "@mapomodule/store/runtime/stores/auth";
import { useSnackStore } from "@mapomodule/store/runtime/stores/snack";

export default defineNuxtPlugin({
  name: "mapo-core:fetch",
  enforce: "pre",
  setup() {
    const rc = useRuntimeConfig().public.mapoCore as Record<string, string>;
    const logoutUrl = rc.logoutUrl;
    const loginUrl = rc.loginUrl;

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

    // Global loading counter — incremented on every request, decremented on
    // every response (success or error). Exposed as $mapoFetchLoading so any
    // component can show a spinner without wrapping every fetch call manually.
    const pending = ref(0);
    const mapoFetchLoading = computed(() => pending.value > 0);

    const mapoFetch = $fetch.create({
      onRequest() {
        pending.value++;
      },
      onResponse({ response, request }) {
        pending.value--;
        handle(response.status, String(request));
      },
      onResponseError({ response, request, error }) {
        pending.value--;
        handle(response?.status ?? 0, String(request));
        return Promise.reject(error);
      },
    });

    return {
      provide: { mapoFetch, mapoFetchLoading },
    };
  },
});
