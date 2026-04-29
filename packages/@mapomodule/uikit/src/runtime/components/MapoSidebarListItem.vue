<script setup lang="ts">
import { ref, computed } from "vue";
import { useCanAccessRoute } from "@mapomodule/core/runtime/auth/useCanAccessRoute";
import type { MenuNode } from "@mapomodule/utils";

interface Props {
  node: MenuNode;
  mini?: boolean;
}

const { node, mini = false } = defineProps<Props>();

const open = ref(false);
const hasChildren = computed(() => node.children.length > 0);
const canSee = computed(() => useCanAccessRoute(node.meta));
</script>

<template>
  <li v-if="canSee" class="list-none">
    <!-- Parent item (has children) -->
    <template v-if="hasChildren">
      <UTooltip v-if="mini" :text="node.label" :side="'right'">
        <button
          class="flex w-full items-center justify-center rounded-md p-2 text-muted hover:text-default hover:bg-default/60 transition-colors"
          @click="open = !open"
        >
          <UIcon :name="node.icon" class="size-4.5 shrink-0" />
        </button>
      </UTooltip>
      <template v-else>
        <button
          class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted hover:text-default hover:bg-default/60 transition-colors"
          @click="open = !open"
        >
          <UIcon :name="node.icon" class="size-4.5 shrink-0" />
          <span class="flex-1 truncate text-left font-medium">{{
            node.label
          }}</span>
          <UIcon
            :name="open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
            class="size-3.5 shrink-0 transition-transform"
          />
        </button>
        <ul
          v-if="open"
          class="ml-5 mt-0.5 space-y-0.5 border-l border-default/50 pl-2.5"
        >
          <MapoSidebarListItem
            v-for="child in node.children"
            :key="child.link"
            :node="child"
          />
        </ul>
      </template>
    </template>

    <!-- Leaf item -->
    <template v-else>
      <UTooltip v-if="mini" :text="node.label" :side="'right'">
        <NuxtLink
          :to="node.link"
          class="flex items-center justify-center rounded-md p-2 text-muted hover:text-default hover:bg-default/60 transition-colors"
          active-class="bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
        >
          <UIcon :name="node.icon" class="size-4.5 shrink-0" />
        </NuxtLink>
      </UTooltip>
      <NuxtLink
        v-else
        :to="node.link"
        class="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted hover:text-default hover:bg-default/60 transition-colors"
        active-class="bg-primary/10 text-primary font-medium hover:bg-primary/15 hover:text-primary"
      >
        <UIcon :name="node.icon" class="size-4.5 shrink-0" />
        <span class="truncate font-medium">{{ node.label }}</span>
      </NuxtLink>
    </template>
  </li>
</template>
