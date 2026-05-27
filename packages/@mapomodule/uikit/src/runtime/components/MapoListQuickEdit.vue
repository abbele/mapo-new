<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ref, watch } from "vue";
import type { FieldDescriptor } from "@mapomodule/form/runtime/types/fields.js";
import type { FieldRegistry } from "@mapomodule/form/runtime/composables/useFieldRegistry.js";

const props = withDefaults(
  defineProps<{
    open: boolean;
    endpoint: string;
    itemId?: string | number | null;
    editFields?: FieldDescriptor<T>[];
    lookup?: string;
    languages?: string[];
    registry?: Partial<FieldRegistry>;
  }>(),
  {
    lookup: "id",
    editFields: () => [],
  },
);

const emit = defineEmits<{
  "update:open": [value: boolean];
  saved: [item: T];
}>();

defineSlots<{
  /**
   * Additional content rendered below the form fields, above the action buttons.
   * Receives `{ model: T }` — the current reactive form model.
   */
  extra(props: { model: T }): any;
}>();

const snack = useSnackStore();
const crud = useCrud<T>(props.endpoint);

const model = ref<T>({} as T);
const loading = ref(false);
const saving = ref(false);
const isOpen = computed({
  get: () => props.open,
  set: (v) => emit("update:open", v),
});

watch(
  () => [props.open, props.itemId] as const,
  async ([open, id]) => {
    if (!open) return;
    if (id == null) {
      model.value = {} as T;
      return;
    }
    loading.value = true;
    try {
      model.value = await crud.detail(id as string | number);
    } catch {
      snack.show("Failed to load item", "error");
      isOpen.value = false;
    } finally {
      loading.value = false;
    }
  },
);

async function save() {
  saving.value = true;
  try {
    const result =
      props.itemId != null
        ? await crud.partialUpdate(props.itemId as string | number, model.value)
        : await crud.create(model.value);
    snack.show("Saved", "success");
    emit("saved", result);
    isOpen.value = false;
  } catch (err: unknown) {
    const detail = (err as { response?: { data?: { detail?: string } } })
      ?.response?.data?.detail;
    snack.show(detail ?? "Failed to save", "error");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-highlighted">
            {{ itemId != null ? "Edit" : "New item" }}
          </h3>
          <UButton
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-lucide-x"
            @click="isOpen = false"
          />
        </div>

        <div v-if="loading" class="flex justify-center py-8">
          <UIcon
            name="i-lucide-loader-circle"
            class="h-6 w-6 animate-spin text-muted"
          />
        </div>

        <template v-else>
          <MapoForm
            v-model="model"
            :fields="editFields"
            :languages="languages"
            :registry="registry"
            immediate
          />

          <slot name="extra" :model="model" />

          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" color="neutral" @click="isOpen = false">
              Cancel
            </UButton>
            <UButton color="primary" :loading="saving" @click="save">
              Save
            </UButton>
          </div>
        </template>
      </div>
    </template>
  </UModal>
</template>
