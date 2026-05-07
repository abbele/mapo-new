<script setup lang="ts">
const confirmStore = useConfirmStore();
const toast = useToast();

const lastResult = ref<boolean | null>(null);

async function openConfirm(opts: { title: string; message?: string }) {
  const result = await confirmStore.ask(opts);
  lastResult.value = result;
  toast.add({
    title: result ? "✅ Confirmed" : "❌ Cancelled",
    color: result ? "success" : "neutral",
  });
}
</script>

<template>
  <UContainer class="py-10 max-w-lg">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold">Confirm dialog</h2>
        <p class="text-sm text-muted">
          Tests useConfirmStore.ask() — programmatic confirm
        </p>
      </div>
      <UButton to="/" variant="ghost" leading-icon="i-lucide-arrow-left"
        >Back</UButton
      >
    </div>

    <UCard class="mb-4">
      <div class="flex flex-wrap gap-2">
        <UButton @click="openConfirm({ title: 'Are you sure?' })"
          >Simple confirm</UButton
        >
        <UButton
          color="error"
          variant="soft"
          @click="
            openConfirm({
              title: 'Delete item?',
              message: 'This action cannot be undone.',
            })
          "
          >Destructive confirm</UButton
        >
      </div>

      <div v-if="lastResult !== null" class="mt-4">
        <UAlert
          :color="lastResult ? 'success' : 'neutral'"
          :title="lastResult ? 'User confirmed' : 'User cancelled'"
        />
      </div>
    </UCard>

    <!-- Inline dialog rendered by the store state -->
    <UModal v-model:open="confirmStore.active">
      <template #content>
        <UCard v-if="confirmStore.options">
          <template #header>
            <p class="font-semibold">{{ confirmStore.options.title }}</p>
          </template>
          <p v-if="confirmStore.options.message" class="text-sm text-muted">
            {{ confirmStore.options.message }}
          </p>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="confirmStore.cancel()"
                >Cancel</UButton
              >
              <UButton color="primary" @click="confirmStore.confirm()"
                >Confirm</UButton
              >
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </UContainer>
</template>
