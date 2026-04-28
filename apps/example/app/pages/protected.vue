<script setup lang="ts">
definePageMeta({ middleware: ["auth"] });

const auth = useAuthStore();
</script>

<template>
  <UContainer class="py-10 max-w-lg">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-shield-check" class="text-success" />
          <h2 class="text-lg font-semibold">Protected page</h2>
        </div>
        <p class="text-sm text-muted">
          You can only see this if authenticated (auth middleware).
        </p>
      </template>

      <UAlert
        color="success"
        icon="i-lucide-check-circle"
        title="Auth middleware passed"
      >
        Logged in as <strong>{{ auth.username }}</strong>
      </UAlert>

      <template #footer>
        <UButton to="/" variant="ghost" leading-icon="i-lucide-arrow-left"
          >Back</UButton
        >
      </template>
    </UCard>
  </UContainer>
</template>
