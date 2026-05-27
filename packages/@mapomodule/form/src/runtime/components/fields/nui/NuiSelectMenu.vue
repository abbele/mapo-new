<script setup lang="ts">
import { useNuiFieldAttrs } from "./useNuiFieldAttrs";
defineOptions({ inheritAttrs: false });
const attrs = useNuiFieldAttrs();
</script>
<template>
  <USelectMenu v-bind="attrs" />
</template>
