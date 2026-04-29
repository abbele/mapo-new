<script setup lang="ts">
/**
 * MapoOverride — MapoTopbar
 *
 * Drop this file in app/mapooverride/ to replace the default MapoTopbar.
 * The uikit module detects it via the components:extend hook and swaps it in
 * at build time. Props and slots must remain compatible.
 */
import { useSidebarStore } from "@mapomodule/store/runtime/stores/sidebar";

defineSlots<{
  left(): unknown;
  default(): unknown;
  right(): unknown;
}>();

const sidebar = useSidebarStore();
const colorMode = useColorMode();

function toggleDark() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <header
    class="flex h-14 items-center gap-4 border-b border-default shrink-0 px-4"
    style="
      background: linear-gradient(
        90deg,
        var(--ui-bg-elevated) 0%,
        color-mix(in oklch, var(--color-primary-500) 8%, var(--ui-bg-elevated))
          100%
      );
    "
  >
    <UButton
      v-if="!sidebar.drawer"
      variant="ghost"
      color="neutral"
      icon="i-lucide-panel-left-open"
      size="sm"
      @click="sidebar.toggleDrawer()"
    />

    <!-- Custom brand badge instead of plain text -->
    <span
      class="text-xs font-bold tracking-widest uppercase text-primary px-2 py-0.5 rounded bg-primary/10 select-none"
    >
      Theme Demo
    </span>

    <slot name="left" />

    <div class="flex-1">
      <slot />
    </div>

    <div class="flex items-center gap-2">
      <slot name="right" />

      <!-- Dark mode toggle injected by this override -->
      <UButton
        variant="ghost"
        color="neutral"
        :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
        size="sm"
        :aria-label="
          colorMode.value === 'dark'
            ? 'Switch to light mode'
            : 'Switch to dark mode'
        "
        @click="toggleDark()"
      />
    </div>
  </header>
</template>
