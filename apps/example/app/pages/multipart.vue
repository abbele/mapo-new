<script setup lang="ts">
interface MediaItem {
  id: number;
  file: string;
  name: string;
  [key: string]: unknown;
}

const repo = useCrud<MediaItem>("/api/media/");
const toast = useToast();

const file = ref<File | null>(null);
const name = ref("");
const loading = ref(false);
const result = ref<MediaItem | null>(null);
const policyMode = ref<"auto" | "force" | "disable">("auto");

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  file.value = input.files?.[0] ?? null;
  if (file.value && !name.value) name.value = file.value.name;
}

async function upload() {
  if (!file.value) return;
  loading.value = true;
  result.value = null;
  try {
    result.value = await repo.create(
      { file: file.value, name: name.value },
      {},
      { multipart: policyMode.value },
    );
    toast.add({ title: `Uploaded #${result.value.id}`, color: "success" });
  } catch (e: unknown) {
    toast.add({
      title: "Upload failed",
      description: String(e),
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UContainer class="py-10 max-w-lg">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold">Multipart upload</h2>
        <p class="text-sm text-muted">
          Tests useCrud.create() with File — auto multipart detection.<br />
          Proxy: /api/media/ → /api/camomilla/media on Camomilla.
        </p>
      </div>
      <UButton to="/" variant="ghost" leading-icon="i-lucide-arrow-left"
        >Back</UButton
      >
    </div>

    <UCard>
      <div class="space-y-4">
        <UFormField label="File">
          <input
            type="file"
            @change="onFileChange"
            class="block w-full text-sm"
          />
        </UFormField>

        <UFormField label="Name">
          <UInput v-model="name" class="w-full" placeholder="filename" />
        </UFormField>

        <UFormField label="Multipart policy">
          <USelectMenu
            v-model="policyMode"
            :items="['auto', 'force', 'disable']"
            class="w-full"
          />
          <template #hint>
            <span class="text-xs text-muted">
              auto = detect File/Blob · force = always FormData · disable =
              always JSON
            </span>
          </template>
        </UFormField>

        <UButton
          :loading="loading"
          :disabled="!file"
          @click="upload"
          leading-icon="i-lucide-upload"
          block
        >
          Upload
        </UButton>
      </div>

      <div v-if="result" class="mt-4">
        <UAlert
          color="success"
          title="Upload successful"
          :description="`ID: ${result.id}`"
        />
        <pre class="text-xs bg-muted/50 p-3 rounded mt-2">{{
          JSON.stringify(result, null, 2)
        }}</pre>
      </div>
    </UCard>
  </UContainer>
</template>
