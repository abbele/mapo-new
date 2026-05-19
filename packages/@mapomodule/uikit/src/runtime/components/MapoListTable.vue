<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ref, computed, watch, h, resolveComponent, useSlots } from "vue";
import type { Ref } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { SortingState, PaginationState } from "@tanstack/vue-table";
import type { ListColumn } from "../types/list.js";
import { useSnackStore } from "@mapomodule/store/runtime/stores/snack";
import { useConfirmStore } from "@mapomodule/store/runtime/stores/confirm";
import { usePermissions } from "@mapomodule/store";
import { useCrud } from "@mapomodule/core/runtime/api/crud";
import type { FieldDescriptor, FieldRegistry } from "@mapomodule/form";
import { debounce } from "@mapomodule/utils";
import {
  useRoute,
  useRouter,
  // @ts-expect-error — #imports is a Nuxt virtual module resolved at app build time
} from "#imports";

const props = withDefaults(
  defineProps<{
    endpoint: string;
    /**
     * Clean endpoint used for detail / delete / updateOrder CRUD operations.
     * Defaults to `endpoint` with the query string stripped.
     * Pass this explicitly when `endpoint` carries user-configured query params
     * (e.g. `?fields=id,title`) that must not be included in mutation URLs.
     */
    crudEndpoint?: string;
    /**
     * Extra query params merged into every `list()` call (on top of pagination /
     * sort / search). Used by the parent `MapoList` to pass active filter values
     * and tab params without baking them into the endpoint string.
     */
    filterParams?: Record<string, unknown>;
    /** Initial page size. Default: 20. */
    defaultPageSize?: number;
    /** Page size options shown in the per-page selector. Default: [10, 20, 50, 100]. */
    pageSizeOptions?: number[];
    /**
     * Custom response parser. When provided it replaces the built-in DRF / flat-array
     * detection. Return `{ items, total }` from any shape your backend returns.
     * @example (raw) => ({ items: raw.data, total: raw.meta.total })
     */
    responseAdapter?: (raw: unknown) => { items: T[]; total: number };
    /**
     * Custom pagination query params factory. When provided it replaces the default
     * `{ page, page_size }` params. Use this to support offset/limit or cursor pagination.
     * @example ({ page, pageSize }) => ({ offset: (page - 1) * pageSize, limit: pageSize })
     */
    paginationParams?: (state: {
      page: number;
      pageSize: number;
    }) => Record<string, unknown>;
    columns: ListColumn<T>[];
    lookup?: string;
    searchable?: boolean;
    draggable?: boolean;
    positionField?: string;
    editFields?: FieldDescriptor<T>[];
    languages?: string[];
    registry?: Partial<FieldRegistry>;
    /** Base path for the detail page. If set, each row shows a link button → `${detailBase}/${item[lookup]}`. */
    detailBase?: string;
    /**
     * Django model name for permission gating (e.g. `"article"`).
     * When provided, the edit and delete row buttons are hidden when the user
     * lacks the corresponding `change` / `delete` permission.
     */
    permissionModel?: string;
  }>(),
  {
    lookup: "id",
    searchable: true,
    draggable: false,
    positionField: "position",
    editFields: () => [],
    defaultPageSize: 20,
    pageSizeOptions: () => [10, 20, 50, 100],
  },
);

const emit = defineEmits<{
  "update:selection": [value: T[] | "all"];
  "update:selectionQuery": [value: URLSearchParams];
}>();

defineExpose({ refresh });

defineSlots<{
  /** Extra content rendered alongside the search input in the toolbar. */
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
}>();

const slots = useSlots();

const snack = useSnackStore();
const confirm = useConfirmStore();

// --- URL state (read once on mount, write on change) ---
const route = useRoute();
const router = useRouter();

// `crudBase` is the clean endpoint path used for detail / delete / updateOrder.
// It strips any query string from `endpoint` so mutations are never sent to a
// URL like `/api/case/?fields=id,title/1/`.
const crudBase =
  props.crudEndpoint ?? (props.endpoint.split("?")[0] || props.endpoint);
const crud = useCrud<T>(crudBase);

// --- Permissions ---
const { canChange, canDelete: canDeletePerm } = usePermissions();
const canEditRow = computed(
  () => !props.permissionModel || canChange(props.permissionModel),
);
const canDeleteRow = computed(
  () => !props.permissionModel || canDeletePerm(props.permissionModel),
);

// --- Data state ---
const items = ref<T[]>([]) as Ref<T[]>;
const total = ref(0);
const loading = ref(false);

// --- Pagination (restored from URL) ---
const pagination = ref<PaginationState>({
  pageIndex: route.query.page ? Math.max(0, Number(route.query.page) - 1) : 0,
  pageSize: route.query.page_size
    ? Number(route.query.page_size)
    : props.defaultPageSize,
});

// --- Sorting (restored from URL) ---
const sorting = ref<SortingState>(
  route.query.ordering
    ? String(route.query.ordering)
        .split(",")
        .map((o) => ({
          id: o.startsWith("-") ? o.slice(1) : o,
          desc: o.startsWith("-"),
        }))
    : [],
);

// --- Search (restored from URL) ---
const search = ref(route.query.search ? String(route.query.search) : "");

let searchTimer: ReturnType<typeof setTimeout> | null = null;
function onSearchInput(val: string) {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    search.value = val;
    pagination.value = { ...pagination.value, pageIndex: 0 };
  }, 350);
}

// Write pagination / sorting / search to the URL (debounced to avoid history spam).
const writeUrlState = debounce(() => {
  const query: Record<string, string | undefined> = {
    ...(route.query as Record<string, string>),
  };
  const page = pagination.value.pageIndex + 1;
  if (page > 1) query.page = String(page);
  else delete query.page;
  if (pagination.value.pageSize !== props.defaultPageSize)
    query.page_size = String(pagination.value.pageSize);
  else delete query.page_size;
  if (search.value) query.search = search.value;
  else delete query.search;
  if (sorting.value.length)
    query.ordering = sorting.value
      .map((s: { id: string; desc: boolean }) => `${s.desc ? "-" : ""}${s.id}`)
      .join(",");
  else delete query.ordering;
  router.replace({ query });
}, 150);

watch([pagination, search, sorting], writeUrlState, { deep: true });

// --- Row selection ---
// Selection is keyed by primary key (lookup), not by row index, so pagination/sort/refresh
// changes do not affect which rows are marked as selected.
const rowSelection = ref<Record<string, boolean>>({});
const pkOf = (row: T) => String(row[props.lookup]);
const isAllSelected = computed(
  () =>
    items.value.length > 0 &&
    items.value.every((r) => rowSelection.value[pkOf(r)]),
);
const isIndeterminate = computed(() => {
  const some = items.value.some((r) => rowSelection.value[pkOf(r)]);
  return some && !isAllSelected.value;
});

const selectedRows = computed<T[]>(() =>
  items.value.filter((r) => rowSelection.value[pkOf(r)]),
);
watch(selectedRows, (rows) => {
  emit("update:selection", rows);
  emit("update:selectionQuery", buildSelectionQuery());
});

function buildSelectionQuery(): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page_size", String(pagination.value.pageSize));
  if (search.value) params.set("search", search.value);
  sorting.value.forEach((s) =>
    params.set("ordering", `${s.desc ? "-" : ""}${s.id}`),
  );
  return params;
}

function toggleAll() {
  if (isAllSelected.value) {
    const next = { ...rowSelection.value };
    for (const r of items.value) delete next[pkOf(r)];
    rowSelection.value = next;
  } else {
    const next = { ...rowSelection.value };
    for (const r of items.value) next[pkOf(r)] = true;
    rowSelection.value = next;
  }
}

function toggleRowByKey(key: string) {
  const next = { ...rowSelection.value };
  if (next[key]) delete next[key];
  else next[key] = true;
  rowSelection.value = next;
}

// --- Quick edit ---
const quickEditOpen = ref(false);
const quickEditId = ref<string | number | null>(null);

function openQuickEdit(id: string | number) {
  quickEditId.value = id;
  quickEditOpen.value = true;
}

function onQuickEditSaved() {
  refresh();
}

// --- Delete ---
async function deleteRow(item: T) {
  const ok = await confirm.open({
    title: "Delete item",
    question: "Are you sure you want to delete this item?",
    approveButton: { text: "Delete", attrs: { color: "error" } },
  });
  if (!ok) return;
  try {
    await crud.delete(item[props.lookup] as string | number);
    snack.show("Item deleted", "success");
    refresh();
  } catch {
    snack.show("Failed to delete item", "error");
  }
}

// --- Drag reorder ---
const dragFrom = ref<number | null>(null);

function onDragStart(idx: number) {
  dragFrom.value = idx;
}
function onDragOver(e: DragEvent) {
  e.preventDefault();
}
async function onDrop(toIdx: number) {
  if (dragFrom.value === null || dragFrom.value === toIdx) return;
  const fromIdx = dragFrom.value;
  const arr = [...items.value];
  const moved = arr[fromIdx]!;
  const target = arr[toIdx]!;
  arr.splice(fromIdx, 1);
  arr.splice(toIdx, 0, moved);
  items.value = arr as T[];
  dragFrom.value = null;
  // Persist the new order in a single request: the backend (Camomilla updateOrder)
  // recalculates positions server-side, avoiding N parallel PATCHes and race conditions.
  try {
    await crud.updateOrder(
      moved[props.lookup] as string | number,
      target[props.lookup] as string | number,
    );
    snack.show("Order saved", "success");
  } catch {
    snack.show("Failed to save order", "error");
    refresh();
  }
}

// --- Fetch ---
async function refresh() {
  loading.value = true;
  try {
    // Extract any query params the caller baked into the endpoint (e.g. ?fields=id,title).
    const qIdx = props.endpoint.indexOf("?");
    const endpointParams =
      qIdx >= 0
        ? Object.fromEntries(
            new URLSearchParams(props.endpoint.slice(qIdx + 1)),
          )
        : {};

    const pageState = {
      page: pagination.value.pageIndex + 1,
      pageSize: pagination.value.pageSize,
    };
    const paginationP = props.paginationParams
      ? props.paginationParams(pageState)
      : { page: pageState.page, page_size: pageState.pageSize };

    const params: Record<string, unknown> = {
      ...endpointParams,
      ...(props.filterParams ?? {}),
      ...paginationP,
    };
    if (search.value) params.search = search.value;
    if (sorting.value.length)
      params.ordering = sorting.value
        .map((s) => `${s.desc ? "-" : ""}${s.id}`)
        .join(",");

    const res = await crud.list(params as Record<string, string>);

    if (props.responseAdapter) {
      const adapted = props.responseAdapter(res);
      items.value = adapted.items;
      total.value = adapted.total;
    } else if (res && typeof res === "object" && "results" in res) {
      items.value = (res as { results: T[]; count: number }).results;
      total.value = (res as { results: T[]; count: number }).count;
    } else {
      items.value = res as unknown as T[];
      total.value = (res as unknown as T[]).length;
    }
  } catch {
    snack.show("Failed to load data", "error");
  } finally {
    loading.value = false;
  }
}

// Serialize filterParams to detect deep changes without a deep watcher on the array.
const filterParamsKey = computed(() =>
  JSON.stringify(props.filterParams ?? {}),
);

// Watch all sources that should trigger a refresh.
// When the endpoint or filter context changes, reset to page 1 first.
watch(
  [
    () => props.endpoint,
    filterParamsKey,
    () => pagination.value.pageIndex,
    () => pagination.value.pageSize,
    sorting,
    search,
  ],
  ([newEndpoint, newFilters], [oldEndpoint, oldFilters]) => {
    const contextChanged =
      newEndpoint !== oldEndpoint || newFilters !== oldFilters;
    if (contextChanged && pagination.value.pageIndex !== 0) {
      pagination.value = { ...pagination.value, pageIndex: 0 };
    } else {
      refresh();
    }
  },
  { immediate: true },
);

// --- TanStack column defs ---
const UCheckbox = resolveComponent("UCheckbox");
const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");

const tableColumns = computed<TableColumn<T>[]>(() => {
  const cols: TableColumn<T>[] = [];

  // Checkbox column
  cols.push({
    id: "__select__",
    header: () =>
      h(UCheckbox, {
        modelValue: isAllSelected.value,
        indeterminate: isIndeterminate.value,
        "onUpdate:modelValue": toggleAll,
        ariaLabel: "Select all rows",
      }),
    cell: ({ row }: { row: { original: T } }) => {
      const k = pkOf(row.original);
      return h(UCheckbox, {
        modelValue: !!rowSelection.value[k],
        "onUpdate:modelValue": () => toggleRowByKey(k),
        ariaLabel: "Select row",
      });
    },
    meta: { class: { th: "w-10", td: "w-10" } },
  } as TableColumn<T>);

  // Drag handle column
  if (props.draggable) {
    cols.push({
      id: "__drag__",
      header: "",
      cell: ({ row }: { row: { index: number } }) =>
        h(
          "span",
          {
            class: "cursor-grab text-muted",
            draggable: true,
            onDragstart: () => onDragStart(row.index),
            onDragover: onDragOver,
            onDrop: () => onDrop(row.index),
          },
          h(UIcon, { name: "i-lucide-grip-vertical", class: "h-4 w-4" }),
        ),
      meta: { class: { th: "w-8", td: "w-8" } },
    } as TableColumn<T>);
  }

  // Data columns — the first column gets a navigation link when `detailBase` is set.
  // Any column can be overridden with a `cell.{key}` slot (receives `{ item, value }`).
  const NuxtLink = resolveComponent("NuxtLink");
  for (let i = 0; i < props.columns.length; i++) {
    const col = props.columns[i]!;
    const isFirst = i === 0 && !!props.detailBase;
    cols.push({
      accessorKey: col.key,
      header: col.label,
      cell: ({ row }: { row: { original: T } }) => {
        const cellSlot = slots[`cell.${col.key}`];
        if (cellSlot)
          return cellSlot({ item: row.original, value: row.original[col.key] });
        const cellVal = row.original[col.key];
        if (isFirst) {
          return h(
            NuxtLink,
            {
              to: `${props.detailBase}/${row.original[props.lookup]}`,
              class: "font-medium hover:underline",
            },
            () => String(cellVal ?? "—"),
          );
        }
        return String(cellVal ?? "—");
      },
      meta: { class: { td: col.class ?? "" } },
    } as TableColumn<T>);
  }

  // Actions column
  cols.push({
    id: "__actions__",
    header: "",
    cell: ({ row }: { row: { original: T } }) => {
      const buttons: ReturnType<typeof h>[] = [];
      if (props.editFields.length > 0 && canEditRow.value) {
        buttons.push(
          h(UButton, {
            size: "xs",
            variant: "ghost",
            color: "neutral",
            icon: "i-lucide-pencil",
            onClick: () =>
              openQuickEdit(row.original[props.lookup] as string | number),
          }),
        );
      }
      if (canDeleteRow.value) {
        buttons.push(
          h(UButton, {
            size: "xs",
            variant: "ghost",
            color: "error",
            icon: "i-lucide-trash-2",
            onClick: () => deleteRow(row.original),
          }),
        );
      }
      return h(
        "div",
        { class: "flex items-center gap-1 justify-end" },
        buttons,
      );
    },
    meta: { class: { th: "text-right", td: "text-right" } },
  } as TableColumn<T>);

  return cols;
});

// --- Pagination for UTable ---
const paginationOptions = computed(() => ({
  manualPagination: true,
  rowCount: total.value,
}));

const sortingOptions = computed(() => ({
  manualSorting: true,
}));
</script>

<template>
  <div class="mapo-list-table space-y-3">
    <!-- Search -->
    <div v-if="searchable" class="flex items-center gap-2">
      <UInput
        :model-value="search"
        placeholder="Search..."
        icon="i-lucide-search"
        size="sm"
        class="max-w-xs"
        @update:model-value="onSearchInput"
      />
      <slot name="dtable.toolbar" />
    </div>

    <!-- Table -->
    <UTable
      :data="items"
      :columns="tableColumns"
      :loading="loading"
      :pagination="pagination"
      :pagination-options="paginationOptions"
      :sorting="sorting"
      :sorting-options="sortingOptions"
      empty="Nessun elemento trovato"
      @update:pagination="pagination = $event"
      @update:sorting="sorting = $event"
    >
      <template #empty>
        <slot name="dtable.empty">
          <div class="flex flex-col items-center gap-2 py-8 text-muted">
            <UIcon name="i-lucide-inbox" class="h-8 w-8" />
            <span class="text-sm">No items found</span>
          </div>
        </slot>
      </template>

      <template #loading>
        <slot name="dtable.loading">
          <div class="flex justify-center py-8">
            <UIcon
              name="i-lucide-loader-circle"
              class="h-6 w-6 animate-spin text-muted"
            />
          </div>
        </slot>
      </template>
    </UTable>

    <!-- Pagination controls -->
    <div class="flex items-center justify-between text-sm text-muted">
      <span>{{ total }} items</span>
      <UPagination
        :model-value="pagination.pageIndex + 1"
        :total="total"
        :page-size="pagination.pageSize"
        size="sm"
        @update:model-value="
          pagination = { ...pagination, pageIndex: $event - 1 }
        "
      />
      <USelect
        :model-value="pagination.pageSize"
        :items="
          pageSizeOptions.map((n) => ({ label: `${n} / page`, value: n }))
        "
        size="xs"
        class="w-28"
        @update:model-value="
          pagination = { pageIndex: 0, pageSize: Number($event) }
        "
      />
    </div>

    <!-- Quick edit modal -->
    <MapoListQuickEdit
      v-if="editFields.length > 0"
      v-model:open="quickEditOpen"
      :endpoint="crudBase"
      :item-id="quickEditId"
      :edit-fields="editFields"
      :lookup="lookup"
      :languages="languages"
      :registry="registry"
      @saved="onQuickEditSaved"
    >
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="`qedit.${String(name)}`" v-bind="slotProps ?? {}" />
      </template>
    </MapoListQuickEdit>
  </div>
</template>
