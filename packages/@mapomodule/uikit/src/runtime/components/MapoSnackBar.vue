<script setup lang="ts">
import { watch } from "vue";
import { useSnackStore } from "@mapomodule/store/runtime/stores/snack";
// @ts-expect-error — #imports is a Nuxt virtual module resolved at app build time
import { useToast } from "#imports";

interface SnackMsg {
  id: number;
  message: string;
  type: string;
  duration: number;
}

const snack = useSnackStore();
const toast = useToast();

watch(
  () => snack.current as SnackMsg | null,
  (msg) => {
    if (!msg) return;
    toast.add({
      id: String(msg.id),
      title: msg.message,
      color: msg.type as "success" | "error" | "warning" | "info",
      duration: msg.duration,
    });
  },
);
</script>

<template>
  <UNotifications />
</template>
