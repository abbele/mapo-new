<script setup lang="ts">
import { computed } from "vue";
import { useNuiFieldAttrs } from "./useNuiFieldAttrs";
defineOptions({ inheritAttrs: false });
const rawAttrs = useNuiFieldAttrs();
// NUI v3 uses `items` — accept `options` as alias for backwards compatibility.
const attrs = computed(() => {
  const { options, items, ...rest } = rawAttrs.value as Record<string, unknown>;
  return { ...rest, items: items ?? options };
});
</script>
<template>
  <USelectMenu v-bind="attrs" />
</template>
