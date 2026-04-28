<script setup lang="ts">
const toast = useToast();
const snack = useSnackStore();

const message = ref("Hello from Mapo!");
const duration = ref(4000);
</script>

<template>
  <UContainer class="py-10 max-w-lg">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold">Snackbar</h2>
        <p class="text-sm text-muted">
          Tests useSnackStore (Pinia) + Nuxt UI useToast
        </p>
      </div>
      <UButton to="/" variant="ghost" leading-icon="i-lucide-arrow-left"
        >Back</UButton
      >
    </div>

    <UCard class="mb-4">
      <template #header><p class="font-medium">Settings</p></template>
      <div class="space-y-3">
        <UFormField label="Message">
          <UInput v-model="message" class="w-full" />
        </UFormField>
        <UFormField label="Duration (ms)">
          <UInput v-model.number="duration" type="number" class="w-full" />
        </UFormField>
      </div>
    </UCard>

    <UCard class="mb-4">
      <template #header
        ><p class="font-medium">Nuxt UI toast (useToast)</p></template
      >
      <div class="flex flex-wrap gap-2">
        <UButton
          color="success"
          @click="toast.add({ title: message, color: 'success', duration })"
          >success</UButton
        >
        <UButton
          color="error"
          @click="toast.add({ title: message, color: 'error', duration })"
          >error</UButton
        >
        <UButton
          color="warning"
          @click="toast.add({ title: message, color: 'warning', duration })"
          >warning</UButton
        >
        <UButton
          color="info"
          @click="toast.add({ title: message, color: 'info', duration })"
          >info</UButton
        >
        <UButton variant="soft" @click="toast.add({ title: message, duration })"
          >neutral</UButton
        >
      </div>
    </UCard>

    <UCard>
      <template #header
        ><p class="font-medium">useSnackStore — Pinia state</p></template
      >
      <div class="flex flex-wrap gap-2 mb-4">
        <UButton
          color="success"
          variant="soft"
          @click="snack.show(message, 'success', duration)"
          >show success</UButton
        >
        <UButton
          color="error"
          variant="soft"
          @click="snack.show(message, 'error', duration)"
          >show error</UButton
        >
        <UButton
          color="info"
          variant="soft"
          @click="snack.show(message, 'info', duration)"
          >show info</UButton
        >
        <UButton variant="soft" @click="snack.dismiss()">dismiss</UButton>
      </div>
      <pre class="text-xs bg-muted/50 p-3 rounded">{{
        JSON.stringify(snack.current, null, 2)
      }}</pre>
    </UCard>
  </UContainer>
</template>
