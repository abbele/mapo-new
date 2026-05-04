<script setup lang="ts">
/**
 * News list — powered by <MapoList>.
 *
 * This page connects to the real WnD backend via the Camomilla Nitro proxy
 * (all /api/models/* requests are proxied to the Django REST API with cookie auth).
 *
 * What <MapoList> replaces vs the previous hand-rolled table in this file:
 *   ✅ Manual useLazyFetch + watch pagination    → server-side fetch built in
 *   ✅ Hand-rolled <table> with status helpers   → ListTable with TanStack UTable
 *   ✅ No filters                                → MapoListFilters with chips
 *   ✅ No bulk actions                           → MapoListActions with confirm dialog
 *   ✅ No quick edit                             → MapoListQuickEdit modal per row
 *   ✅ No sorting                                → per-column sort via TanStack
 */

import type { FieldDescriptor } from "@mapomodule/form/runtime/types/index.js";
import type {
  FilterDescriptor,
  ActionDescriptor,
  ListColumn,
} from "@mapomodule/uikit/runtime/types/list.js";

definePageMeta({
  label: "News",
  icon: "i-lucide-newspaper",
  layout: "mapo-default",
  middleware: ["auth"],
});

interface NewsItem {
  id: number;
  title: string | null;
  status: string;
  publication_date: string | null;
  ordering: number;
  identifier: string | null;
  indexable: boolean;
  autopermalink: boolean;
  template_data: {
    titles?: { title?: string; sub_title?: string };
  } | null;
}

// ─── Table columns ────────────────────────────────────────────────────────────
const columns: ListColumn[] = [
  {
    key: "id",
    label: "ID",
    sortable: false,
    class: "w-14 font-mono text-xs text-muted",
  },
  { key: "title", label: "Title", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "publication_date", label: "Published", sortable: true },
  {
    key: "ordering",
    label: "Order",
    sortable: true,
    class: "w-20 text-center",
  },
];

// ─── Status filter ────────────────────────────────────────────────────────────
// In v1: a hand-rolled <v-select multiple> inside a drawer, with manual URL serialization.
// Here: a descriptor. MapoList appends ?status=PUB&status=DRF to the endpoint automatically.
const filters: FilterDescriptor[] = [
  {
    value: "status",
    text: "Status",
    multiple: true,
    choices: [
      { text: "Published", value: "PUB", icon: "i-lucide-circle-check" },
      { text: "Draft", value: "DRF", icon: "i-lucide-pencil" },
      { text: "Scheduled", value: "PLA", icon: "i-lucide-clock" },
      { text: "Trash", value: "TRS", icon: "i-lucide-trash-2" },
    ],
  },
  {
    value: "indexable",
    text: "Indexable",
    choices: [
      { text: "Yes", value: "true" },
      { text: "No", value: "false" },
    ],
  },
];

// ─── Bulk actions ─────────────────────────────────────────────────────────────
const actions: ActionDescriptor<NewsItem>[] = [
  {
    label: "Set as Published",
    permissions: ["change_news"],
    handleMultiple: true,
    handler: async ({ selection }) => {
      if (!selection) return;
      await Promise.all(
        selection.map((item) =>
          $fetch(`/api/models/news/${item.id}/`, {
            method: "PATCH",
            body: { status: "PUB" },
          }),
        ),
      );
    },
  },
  {
    label: "Set as Draft",
    permissions: ["change_news"],
    handleMultiple: true,
    handler: async ({ selection }) => {
      if (!selection) return;
      await Promise.all(
        selection.map((item) =>
          $fetch(`/api/models/news/${item.id}/`, {
            method: "PATCH",
            body: { status: "DRF" },
          }),
        ),
      );
    },
  },
  {
    label: "Move to Trash",
    permissions: ["change_news"],
    handleMultiple: true,
    handler: async ({ selection }) => {
      if (!selection) return;
      await Promise.all(
        selection.map((item) =>
          $fetch(`/api/models/news/${item.id}/`, {
            method: "PATCH",
            body: { status: "TRS" },
          }),
        ),
      );
    },
  },
];

// ─── Quick-edit fields ────────────────────────────────────────────────────────
// Same FieldDescriptor syntax as MapoDetail. The pencil button on each row opens
// a modal pre-populated with the item data — no custom dialog code needed.

const quickEditFields: FieldDescriptor<NewsItem>[] = [
  {
    key: "status",
    type: "select",
    label: "Status",
    attrs: {
      items: [
        { label: "Published", value: "PUB" },
        { label: "Draft", value: "DRF" },
        { label: "Scheduled", value: "PLA" },
        { label: "Trash", value: "TRS" },
      ],
    },
  },
  {
    key: "publication_date",
    type: "datetime",
    label: "Publication date",
  },
  {
    key: "ordering",
    type: "number",
    label: "Order",
    attrs: { min: 0 },
  },
];
</script>

<template>
  <!--
    MapoList wires up: fetch → table → pagination → sorting → search →
    filters → filter chips → bulk actions → confirm dialogs → quick-edit modal.
    All server-side, all type-safe, all from one component.

    The endpoint /api/models/news/ is the Django REST API proxied by Camomilla.
    Query params (page, page_size, ordering, search, status) are appended automatically.
  -->
  <div class="p-6">
    <MapoList
      endpoint="/api/models/news/"
      :columns="columns"
      :filters="filters"
      :actions="actions"
      :edit-fields="quickEditFields"
      lookup="id"
      :searchable="true"
      detail-base="/news"
    >
      <template #head>
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-semibold">News</h1>
          <UButton icon="i-lucide-plus" to="/news/new" size="sm">
            New article
          </UButton>
        </div>
      </template>
    </MapoList>
  </div>
</template>
