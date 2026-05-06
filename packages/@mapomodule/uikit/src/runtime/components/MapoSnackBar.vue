<script setup lang="ts">
import { watch } from "vue";
import { useSnackStore } from "@mapomodule/store/runtime/stores/snack";
// @ts-expect-error — #imports is a Nuxt virtual module resolved at app build time
import { useToast } from "#imports";

const snack = useSnackStore();
const toast = useToast();

const _shown = new Set<number>();

watch(
  () => snack.messages,
  (msgs) => {
    if (msgs.length === 0) {
      for (const id of _shown) toast.remove(String(id));
      _shown.clear();
      return;
    }
    for (const msg of msgs) {
      if (_shown.has(msg.id)) continue;
      _shown.add(msg.id);
      toast.add({
        id: String(msg.id),
        title: msg.message,
        color: msg.type as "success" | "error" | "warning" | "info",
        duration: msg.duration,
        onClose: () => snack.dismiss(msg.id),
      });
    }
  },
  { deep: true },
);
</script>

<!-- eslint-disable vue/valid-template-root -->
<template>
  <!-- Nuxt UI v3: toasts are rendered by the global <Toaster> in ConfigProvider -->
</template>
