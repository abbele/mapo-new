<script setup lang="ts">
import type { FieldDescriptor } from "@mapomodule/form/runtime/types/index.js";
defineOptions({ inheritAttrs: false });
defineProps<{
  modelValue?: unknown;
  errors?: string[];
  descriptor?: FieldDescriptor;
  disabled?: boolean;
  readonly?: boolean;
}>();
const emit = defineEmits<{ "update:modelValue": [value: unknown]; blur: [] }>();
</script>
<template>
  <v-text-field
    :model-value="modelValue as string | number | null | undefined"
    :error-messages="errors ?? []"
    :disabled="disabled"
    :readonly="readonly"
    :placeholder="descriptor?.attrs?.placeholder as string | undefined"
    density="comfortable"
    variant="outlined"
    hide-details="auto"
    @update:model-value="(v) => emit('update:modelValue', v)"
    @blur="emit('blur')"
  />
</template>
