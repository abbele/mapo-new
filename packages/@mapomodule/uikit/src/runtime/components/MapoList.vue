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
    columns: ListColumn<T>[];
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
    // Pagination
    /** Initial page size. Default: 20. */
    defaultPageSize?: number;
    /** Page size options shown in the per-page selector. Default: [10, 20, 50, 100]. */
    pageSizeOptions?: number[];
    /**
     * Custom response parser. Replaces the built-in DRF / flat-array detection.
     * Return `{ items, total }` from any shape your backend returns.
     * @example (raw) => ({ items: raw.data, total: raw.meta.total })
     */
    responseAdapter?: (raw: unknown) => { items: T[]; total: number };
    /**
     * Custom pagination query params factory. Replaces default `{ page, page_size }`.
     * @example ({ page, pageSize }) => ({ offset: (page - 1) * pageSize, limit: pageSize })
     */
    paginationParams?: (state: {
      page: number;
      pageSize: number;
    }) => Record<string, unknown>;
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
    defaultPageSize: 20,
    pageSizeOptions: () => [10, 20, 50, 100],
  },
);

// --- Selection state ---
const selection = ref<T[] | "all">([]) as Ref<T[] | "all">;
const selectionQuery = ref(new URLSearchParams());

// --- Filters state ---
const activeFilters = ref<ActiveFilter[]>([]);

// --- Tabs state ---
const activeTab = ref(props.defaultTab ?? props.tabs[0]?.value ?? "");

// --- crudEndpoint: the base path used for detail / delete / updateOrder. ---
// Strips any query string from the user-supplied endpoint so mutation URLs
// are never constructed as `/api/case/?fields=id,title/1/`.
const crudEndpoint = computed(
  () => props.endpoint.split("?")[0] || props.endpoint,
);

// --- filterParams: active tab + active filters as a plain params object. ---
// Passed directly to MapoListTable instead of being baked into the endpoint
// string — this is what actually fixes B1 (filters/sorting ignored).
const filterParams = computed<Record<string, unknown>>(() => {
  const params: Record<string, unknown> = {};
  if (props.tabs.length && activeTab.value) {
    params[props.tabQueryParam] = activeTab.value;
  }
  for (const f of activeFilters.value) {
    if (!f.active.length) continue;
    params[f.value] =
      f.active.length === 1 ? f.active[0]!.value : f.active.map((c) => c.value);
  }
  return params;
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
   * Receives `{ item: T, value: T[keyof T] }`.
   */
  [K: `cell.${string}`]: (props: { item: T; value: T[keyof T] }) => any;
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
          :endpoint="crudEndpoint"
          :lookup="lookup"
          @action-completed="refresh"
        />
      </div>
    </div>

    <!-- Table -->
    <MapoListTable
      ref="tableRef"
      :endpoint="endpoint"
      :crud-endpoint="crudEndpoint"
      :filter-params="filterParams"
      :columns="columns"
      :lookup="lookup"
      :searchable="searchable"
      :draggable="draggable"
      :position-field="positionField"
      :edit-fields="editFields"
      :languages="languages"
      :registry="registry"
      :detail-base="detailBase"
      :default-page-size="defaultPageSize"
      :page-size-options="pageSizeOptions"
      :response-adapter="responseAdapter"
      :pagination-params="paginationParams"
      @update:selection="selection = $event"
      @update:selection-query="selectionQuery = $event"
    >
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </MapoListTable>
  </div>
</template>
