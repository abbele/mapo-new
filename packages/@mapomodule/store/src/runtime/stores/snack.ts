import { defineStore } from "pinia";
import { SnackTypeEnum } from "../types";
import type { SnackMessage, SnackType } from "../types";

let _nextId = 0;

export const useSnackStore = defineStore("mapo-snack", {
  state: () => ({
    messages: [] as SnackMessage[],
  }),

  getters: {
    current: (state): SnackMessage | null =>
      state.messages[state.messages.length - 1] ?? null,
  },

  actions: {
    show(
      message: string,
      type: SnackType = SnackTypeEnum.Info,
      duration = 4000,
    ) {
      this.messages.push({ id: ++_nextId, message, type, duration });
    },

    dismiss(id?: number) {
      if (id !== undefined) {
        this.messages = this.messages.filter((m) => m.id !== id);
      } else {
        this.messages.pop();
      }
    },

    dismissAll() {
      this.messages = [];
    },
  },
});
