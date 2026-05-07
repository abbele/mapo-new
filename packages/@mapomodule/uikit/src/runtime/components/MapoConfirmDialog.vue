<script setup lang="ts">
import { useConfirmStore } from "@mapomodule/store/runtime/stores/confirm";

const store = useConfirmStore();
</script>

<template>
  <UModal v-model:open="store.active" :dismissible="false">
    <template #content>
      <div class="p-6 space-y-4">
        <div class="space-y-1">
          <h3 class="text-base font-semibold text-highlighted">
            {{ store.options?.title ?? "Confirm" }}
          </h3>
          <p class="text-sm text-muted">
            {{ store.options?.message }}
          </p>
        </div>

        <div class="flex justify-end gap-3">
          <UButton variant="ghost" color="neutral" @click="store.cancel()">
            {{ store.options?.cancelText ?? "Cancel" }}
          </UButton>
          <UButton
            :color="store.options?.dangerous ? 'error' : 'primary'"
            @click="store.confirm()"
          >
            {{ store.options?.confirmText ?? "Confirm" }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
