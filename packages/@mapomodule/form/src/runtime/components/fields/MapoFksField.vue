<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { debounce } from "@mapomodule/utils";
import type { FksDescriptor } from "../../types/index.js";

const props = defineProps<{
  modelValue: unknown;
  descriptor: FksDescriptor;
  errors?: string[];
  readonly?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{ "update:modelValue": [value: unknown] }>();

const attrs = computed(() => props.descriptor.attrs);
const isMultiple = computed(
  () => props.descriptor.type === "m2m" || !!attrs.value.multiple,
);
const itemText = computed(() => attrs.value.itemText ?? "name");
const itemValue = computed(() => attrs.value.itemValue ?? "id");

// ─── Remote search ───────────────────────────────────────────────────────────

const items = ref<Record<string, unknown>[]>([]);
const isLoading = ref(false);
const searchTerm = ref("");

async function fetchItems(query: string) {
  isLoading.value = true;
  try {
    // Nuxt's $fetch handles relative paths on both server and client, so no location.origin is needed.
    const endpoint = attrs.value.endpoint;
    const url = query
      ? `${endpoint}${endpoint.includes("?") ? "&" : "?"}search=${encodeURIComponent(query)}`
      : endpoint;
    const data = await $fetch<unknown>(url);
    // Supports both a plain array and a paginated DRF response { results: [] }.
    const raw = Array.isArray(data)
      ? data
      : ((data as { results?: unknown[] }).results ?? []);
    items.value = raw as Record<string, unknown>[];
  } catch {
    items.value = [];
  } finally {
    isLoading.value = false;
  }
}

const debouncedFetch = debounce(fetchItems, 300);

// onMounted: fetching is client-only (the select is interactive, so SSR fetch does not add value).
onMounted(() => fetchItems(""));
watch(searchTerm, (q) => debouncedFetch(q));

// ─── Value ───────────────────────────────────────────────────────────────────

// returnObject=true (default): modelValue is an object or array of objects.
// returnObject=false: modelValue is an id or array of ids.
const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Placeholder
const placeholder = computed(() =>
  isMultiple.value ? "Search and select..." : "Search...",
);

// Chip text shown in the trigger.
function getLabel(item: unknown): string {
  if (!item || typeof item !== "object") return String(item);
  return String((item as Record<string, unknown>)[itemText.value] ?? "");
}
</script>

<template>
  <USelectMenu
    v-model="internalValue"
    v-model:search-term="searchTerm"
    :items="items"
    :label-key="itemText"
    :value-key="attrs.returnObject === false ? itemValue : undefined"
    :by="attrs.returnObject !== false ? (itemValue as string) : undefined"
    :multiple="isMultiple"
    :loading="isLoading"
    :ignore-filter="true"
    :placeholder="placeholder"
    :readonly="readonly"
    :disabled="disabled"
    :highlight="!!errors?.length"
    clear
  >
    <!-- Chips for multi-selection -->
    <template
      v-if="isMultiple && Array.isArray(internalValue) && internalValue.length"
      #default
    >
      <div class="flex flex-wrap gap-1 py-0.5">
        <UBadge
          v-for="item in internalValue as unknown[]"
          :key="
            (item as Record<string, unknown>)[itemValue as string] as string
          "
          variant="soft"
          color="primary"
          class="cursor-default"
        >
          {{ getLabel(item) }}
          <UButton
            v-if="!readonly && !disabled"
            size="xs"
            variant="ghost"
            color="primary"
            icon="i-lucide-x"
            class="-mr-1 ml-0.5 h-3.5 w-3.5"
            @click.stop="
              internalValue = (internalValue as unknown[]).filter(
                (i) =>
                  (i as Record<string, unknown>)[itemValue as string] !==
                  (item as Record<string, unknown>)[itemValue as string],
              )
            "
          />
        </UBadge>
      </div>
    </template>

    <!-- Empty state -->
    <template #empty>
      <span class="text-sm text-gray-500">
        {{ searchTerm ? "No results found" : "No items available" }}
      </span>
    </template>
  </USelectMenu>
</template>
