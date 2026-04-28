import { defineStore } from "pinia";
import { SnackTypeEnum } from "../types";
import type { SnackMessage, SnackType } from "../types";

let _nextId = 0;

export const useSnackStore = defineStore("mapo-snack", {
  state: () => ({
    current: null as SnackMessage | null,
  }),

  actions: {
    show(
      message: string,
      type: SnackType = SnackTypeEnum.Info,
      duration = 4000,
    ) {
      this.current = { id: ++_nextId, message, type, duration };
    },

    dismiss() {
      this.current = null;
    },
  },
});
