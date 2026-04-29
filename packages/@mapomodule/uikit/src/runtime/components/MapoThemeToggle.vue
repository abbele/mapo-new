<script setup lang="ts">
import { computed } from "vue";
// @ts-expect-error — #imports is a Nuxt virtual module resolved at app build time
import { useColorMode } from "#imports";

const colorMode = useColorMode();

const isDark = computed(() => colorMode.value === "dark");

function toggle() {
  colorMode.preference = isDark.value ? "light" : "dark";
}
</script>

<template>
  <UButton
    :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
    variant="ghost"
    color="neutral"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  />
</template>
