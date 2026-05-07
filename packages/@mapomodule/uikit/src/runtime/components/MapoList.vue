<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ref, computed, watch } from "vue";
import type { Ref } from "vue";
import type {
  ListColumn,
  FilterDescriptor,
  FilterChoice,
  ActiveFilter,
  ActionDescriptor,
  ListTabItem,
} from "../types/list.js";
import type { FieldDescriptor, FieldRegistry } from "@mapomodule/form";

const props = withDefaults(
  defineProps<{
    endpoint: string;
    columns: ListColumn[];
    lookup?: string;
    // Filters
    filters?: FilterDescriptor[];
    // Actions
    actions?: ActionDescriptor<T>[];
    // Tabs
    tabs?: ListTabItem[];
    defaultTab?: string;
    tabQueryParam?: string;
    // Table features
    searchable?: boolean;
    draggable?: boolean;
    positionField?: string;
    // Quick edit
    editFields?: FieldDescriptor<T>[];
    languages?: string[];
    registry?: Partial<FieldRegistry>;
    /** Base path for the detail page link on each row. E.g. "/news" → links to "/news/42". */
    detailBase?: string;
  }>(),
  {
    lookup: "id",
    filters: () => [],
    actions: () => [],
    tabs: () => [],
    tabQueryParam: "tab",
    searchable: true,
    draggable: false,
    positionField: "position",
    editFields: () => [],
  },
);

// --- Selection state ---
const selection = ref<T[] | "all">([]) as Ref<T[] | "all">;
const selectionQuery = ref(new URLSearchParams());

// --- Filters state ---
const activeFilters = ref<ActiveFilter[]>([]);

// --- Tabs state ---
const activeTab = ref(props.defaultTab ?? props.tabs[0]?.value ?? "");

// --- Computed endpoint (with tab param) ---
const resolvedEndpoint = computed(() => {
  if (!props.tabs.length || !activeTab.value) return props.endpoint;
  const sep = props.endpoint.includes("?") ? "&" : "?";
  return `${props.endpoint}${sep}${props.tabQueryParam}=${activeTab.value}`;
});

// --- Filter query params merged into endpoint ---
const endpointWithFilters = computed(() => {
  let base = resolvedEndpoint.value;
  if (!activeFilters.value.length) return base;
  const sep = base.includes("?") ? "&" : "?";
  const parts = activeFilters.value.flatMap((f) =>
    f.active.map(
      (c) =>
        `${encodeURIComponent(f.value)}=${encodeURIComponent(String(c.value))}`,
    ),
  );
  return base + sep + parts.join("&");
});

// --- Table ref for refresh ---
const tableRef = ref<{ refresh: () => void } | null>(null);

function refresh() {
  tableRef.value?.refresh();
}

defineExpose({ refresh });

defineSlots<{
  /** Content rendered inside the list head area (title, breadcrumbs, action buttons). */
  head(): any;
  /** Extra content rendered alongside the search input in the table toolbar. */
  "dtable.toolbar"(): any;
  /** Override for the empty state displayed when no rows are found. */
  "dtable.empty"(): any;
  /** Override for the loading skeleton displayed while data is being fetched. */
  "dtable.loading"(): any;
  /**
   * Per-column cell override. Slot name: `cell.{column.key}`.
   * Receives `{ item: T, value: unknown }`.
   */
  [K: `cell.${string}`]: (props: { item: T; value: unknown }) => any;
  /**
   * Per-filter custom panel content. Slot name: `filter.{filter.value}`.
   * Receives `{ filter, toggleChoice, removeFilter }`.
   */
  [K: `filter.${string}`]: (props: {
    filter: FilterDescriptor & { dates?: string[] };
    toggleChoice: (filter: FilterDescriptor, choice: FilterChoice) => void;
    removeFilter: (filter: FilterDescriptor) => void;
  }) => any;
  /**
   * Extra content rendered below the quick-edit form.
   * Receives `{ model: T }` — the current reactive form model.
   */
  "qedit.extra": (props: { model: T }) => any;
}>();

// Reset selection when the active tab or filters change
watch([activeTab, activeFilters], () => {
  selection.value = [];
});
</script>

<template>
  <div class="mapo-list space-y-4">
    <!-- Head slot -->
    <MapoListHead>
      <template #head>
        <slot name="head" />
      </template>
    </MapoListHead>

    <!-- Tabs -->
    <MapoListTabs
      v-if="tabs.length"
      :tabs="tabs"
      :model-value="activeTab"
      @update:model-value="activeTab = $event"
    />

    <!-- Toolbar: filters + actions -->
    <div class="flex flex-wrap items-center gap-2">
      <MapoListFilters
        :filters="filters"
        :model-value="activeFilters"
        @update:model-value="activeFilters = $event"
      >
        <template v-for="(_, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps ?? {}" />
        </template>
      </MapoListFilters>

      <div class="ml-auto">
        <MapoListActions
          :actions="actions"
          :selection="selection"
          :selection-query="selectionQuery"
          :endpoint="endpoint"
          :lookup="lookup"
          @action-completed="refresh"
        />
      </div>
    </div>

    <!-- Table -->
    <MapoListTable
      ref="tableRef"
      :endpoint="endpointWithFilters"
      :columns="columns"
      :lookup="lookup"
      :searchable="searchable"
      :draggable="draggable"
      :position-field="positionField"
      :edit-fields="editFields"
      :languages="languages"
      :registry="registry"
      :detail-base="detailBase"
      @update:selection="selection = $event"
      @update:selection-query="selectionQuery = $event"
    >
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </MapoListTable>
  </div>
</template>
