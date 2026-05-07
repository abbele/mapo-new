<script setup lang="ts">
interface CamomillaContent {
  id: number;
  title: string;
  [key: string]: unknown;
}

const repo = useCrud<CamomillaContent>("/api/contents/");
const toast = useToast();

const items = ref<CamomillaContent[]>([]);
const count = ref(0);
const page = ref(1);
const search = ref("");
const loading = ref(false);
const newTitle = ref("");
const creating = ref(false);

const columns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "title", header: "Title" },
  { id: "actions", header: "" },
];

async function load() {
  loading.value = true;
  try {
    const res = await repo.list({ page: page.value, search: search.value });
    items.value = res.results;
    count.value = res.count;
  } catch (e: unknown) {
    toast.add({ title: "Load failed", description: String(e), color: "error" });
  } finally {
    loading.value = false;
  }
}

async function remove(id: number) {
  try {
    await repo.delete(id);
    toast.add({ title: `Deleted #${id}`, color: "success" });
    await load();
  } catch (e: unknown) {
    toast.add({
      title: "Delete failed",
      description: String(e),
      color: "error",
    });
  }
}

async function create() {
  if (!newTitle.value.trim()) return;
  creating.value = true;
  try {
    const item = await repo.create({ title: newTitle.value });
    toast.add({ title: `Created #${item.id}`, color: "success" });
    newTitle.value = "";
    await load();
  } catch (e: unknown) {
    toast.add({
      title: "Create failed",
      description: String(e),
      color: "error",
    });
  } finally {
    creating.value = false;
  }
}

onMounted(load);
watch([page, search], load);
</script>

<template>
  <UContainer class="py-10 max-w-4xl">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold">CRUD — /api/contents/</h2>
        <p class="text-sm text-muted">
          Tests useCrud list / create / delete. Proxy: /api/contents/ →
          /api/contents/ on Camomilla.
        </p>
      </div>
      <UButton to="/" variant="ghost" leading-icon="i-lucide-arrow-left"
        >Back</UButton
      >
    </div>

    <UCard class="mb-6">
      <div class="flex gap-3 items-center">
        <UInput
          v-model="search"
          placeholder="Search…"
          class="flex-1"
          @keyup.enter="load"
        />
        <UButton :loading="loading" @click="load" leading-icon="i-lucide-search"
          >Search</UButton
        >
        <UBadge variant="subtle" color="neutral">{{ count }} total</UBadge>
      </div>
    </UCard>

    <UCard class="mb-4">
      <UTable :data="items" :columns="columns" :loading="loading">
        <template #actions-cell="{ row }">
          <UButton
            color="error"
            variant="ghost"
            size="xs"
            leading-icon="i-lucide-trash-2"
            @click="remove(row.original.id)"
          >
            Delete
          </UButton>
        </template>
      </UTable>

      <div class="flex items-center gap-3 mt-4">
        <UButton :disabled="page <= 1" @click="page--" variant="soft" size="sm"
          >Prev</UButton
        >
        <span class="text-sm">Page {{ page }}</span>
        <UButton @click="page++" variant="soft" size="sm">Next</UButton>
      </div>
    </UCard>

    <UCard>
      <template #header><p class="font-medium">Create item</p></template>
      <div class="flex gap-3">
        <UInput
          v-model="newTitle"
          placeholder="Title…"
          class="flex-1"
          @keyup.enter="create"
        />
        <UButton
          :loading="creating"
          @click="create"
          leading-icon="i-lucide-plus"
          >Create</UButton
        >
      </div>
    </UCard>
  </UContainer>
</template>
