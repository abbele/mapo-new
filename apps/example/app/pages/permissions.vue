<script setup lang="ts">
const perms = usePermissions();
const auth = useAuthStore();

const modelInput = ref("article");
const roleInput = ref("admin");

const checks = computed(() => [
  {
    label: `canView('${modelInput.value}')`,
    result: perms.canView(modelInput.value),
  },
  {
    label: `canAdd('${modelInput.value}')`,
    result: perms.canAdd(modelInput.value),
  },
  {
    label: `canChange('${modelInput.value}')`,
    result: perms.canChange(modelInput.value),
  },
  {
    label: `canDelete('${modelInput.value}')`,
    result: perms.canDelete(modelInput.value),
  },
  {
    label: `checkPermission('view_${modelInput.value}')`,
    result: perms.checkPermission(`view_${modelInput.value}`),
  },
  {
    label: `hasRole('${roleInput.value}')`,
    result: perms.hasRole(roleInput.value),
  },
]);
</script>

<template>
  <UContainer class="py-10 max-w-xl">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold">Permissions</h2>
        <p class="text-sm text-muted">Tests usePermissions() composable</p>
      </div>
      <UButton to="/" variant="ghost" leading-icon="i-lucide-arrow-left"
        >Back</UButton
      >
    </div>

    <UCard class="mb-4">
      <div class="space-y-3">
        <UFormField label="Model name">
          <UInput v-model="modelInput" placeholder="article" class="w-full" />
        </UFormField>
        <UFormField label="Role name">
          <UInput v-model="roleInput" placeholder="admin" class="w-full" />
        </UFormField>
      </div>
    </UCard>

    <UCard>
      <template #header><p class="font-medium">Results</p></template>
      <div class="space-y-2">
        <div
          v-for="check in checks"
          :key="check.label"
          class="flex items-center justify-between py-2 border-b last:border-0"
        >
          <code class="text-sm">{{ check.label }}</code>
          <UBadge :color="check.result ? 'success' : 'error'" variant="subtle">
            {{ check.result ? "true" : "false" }}
          </UBadge>
        </div>
      </div>

      <template #footer>
        <p class="text-xs text-muted">
          User groups: {{ auth.info?.groups?.join(", ") || "—" }}
        </p>
        <p class="text-xs text-muted">
          Raw permissions (first 5):
          {{ auth.permissions.slice(0, 5).join(", ") || "—" }}
        </p>
      </template>
    </UCard>
  </UContainer>
</template>
