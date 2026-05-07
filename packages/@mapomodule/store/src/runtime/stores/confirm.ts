import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import type { ConfirmOptions } from "../types";

export const useConfirmStore = defineStore("mapo-confirm", () => {
  const active = ref(false);
  const options = ref<ConfirmOptions | null>(null);
  const _resolve = shallowRef<((value: boolean) => void) | null>(null);

  function ask(opts: ConfirmOptions): Promise<boolean> {
    options.value = opts;
    active.value = true;
    return new Promise<boolean>((resolve) => {
      _resolve.value = resolve;
    });
  }

  function confirm() {
    _resolve.value?.(true);
    _close();
  }

  function cancel() {
    _resolve.value?.(false);
    _close();
  }

  function _close() {
    active.value = false;
    options.value = null;
    _resolve.value = null;
  }

  return { active, options, ask, confirm, cancel };
});
