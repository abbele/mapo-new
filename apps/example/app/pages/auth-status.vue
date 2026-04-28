<script setup lang="ts">
const auth = useAuthStore();
const { logout, fetchUser } = useMapoAuth();
const toast = useToast();

const loading = ref(false);

async function refresh() {
  loading.value = true;
  try {
    await fetchUser();
    toast.add({ title: "User refreshed", color: "success" });
  } catch (e: unknown) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  } finally {
    loading.value = false;
  }
}

const rows = computed(() => [
  { key: "isAuthenticated", value: String(auth.isAuthenticated) },
  { key: "isLoggedIn", value: String(auth.isLoggedIn) },
  { key: "username", value: auth.username ?? "—" },
  { key: "role", value: auth.role ?? "—" },
]);

const columns = [
  { accessorKey: "key", header: "Property" },
  { accessorKey: "value", header: "Value" },
];
</script>

<template>
  <UContainer class="py-10 max-w-3xl">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold">Auth status</h2>
        <p class="text-sm text-muted">
          Tests SSR hydration, useAuthStore, GET /api/profiles/me/
        </p>
      </div>
      <div class="flex gap-2">
        <UButton :loading="loading" @click="refresh" variant="soft"
          >Re-fetch user</UButton
        >
        <UButton color="error" variant="soft" @click="logout">Logout</UButton>
        <UButton to="/" variant="ghost" leading-icon="i-lucide-arrow-left"
          >Back</UButton
        >
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <UCard>
        <template #header><p class="font-medium">Store state</p></template>
        <UTable :data="rows" :columns="columns" />
      </UCard>

      <UCard>
        <template #header><p class="font-medium">Raw user info</p></template>
        <pre class="text-xs overflow-auto max-h-64">{{
          JSON.stringify(auth.info, null, 2)
        }}</pre>
      </UCard>

      <UCard class="lg:col-span-2">
        <template #header
          ><p class="font-medium">Model permissions</p></template
        >
        <pre class="text-xs overflow-auto max-h-64">{{
          JSON.stringify(auth.modelPermissions, null, 2)
        }}</pre>
      </UCard>
    </div>
  </UContainer>
</template>
