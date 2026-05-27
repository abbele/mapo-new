<script setup lang="ts">
/**
 * Articles list — powered by <MapoList>.
 *
 * In Mapo v1 (Vuetify 2), a page like this required:
 *   - A hand-rolled <v-data-table> with manual :headers and :items bindings
 *   - A custom fetch in created() / mounted() that you wired to pagination events
 *   - A separate <v-dialog> for bulk actions with imperative open/close logic
 *   - Another <v-dialog> for filters, with individual v-model per filter
 *   - A <v-chip-group> for active filter chips you assembled yourself
 *   - A custom confirm dialog wired to a separate Vuex action for bulk delete
 *   - Tab state managed in data() and synced to the URL query manually
 *   - Quick-edit: a full separate page or yet another dialog you built from scratch
 *
 * In Mapo v2, the entire page is <MapoList> with declarative props.
 * The component handles: server-side fetch, pagination, sorting, debounced search,
 * filter chips, bulk actions with confirm, permission checks, tab-based endpoint
 * switching, and quick-edit via a pre-built modal — all with zero custom logic here.
 */

import type { FieldDescriptor } from "@mapomodule/form/runtime/types/index.js";
import type {
  FilterDescriptor,
  ActionDescriptor,
  ListColumn,
  ListTabItem,
} from "@mapomodule/uikit/runtime/types/list.js";

definePageMeta({
  label: "Articles",
  icon: "i-lucide-newspaper",
  layout: "mapo-default",
  middleware: ["auth"],
});

interface Article {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  published_at: string | null;
  priority: number;
  translations: Record<string, { title?: string; body?: string }>;
}

// ─── Columns ──────────────────────────────────────────────────────────────────
// In v1 you wrote Vuetify header objects with manual value/text/sortable.
// Here, key maps to the object property — no accessor functions needed for primitives.
const columns: ListColumn[] = [
  {
    key: "id",
    label: "ID",
    sortable: false,
    class: "w-14 font-mono text-xs text-muted",
  },
  { key: "title", label: "Title", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "published_at", label: "Published", sortable: true },
  {
    key: "priority",
    label: "Priority",
    sortable: true,
    class: "w-20 text-center",
  },
];

// ─── Filters ──────────────────────────────────────────────────────────────────
// In v1: a custom filter panel with v-model per checkbox group, manual chip rendering,
// manual URL param serialization, and manual reset logic.
// Here: one descriptor object per filter — MapoList handles everything else.
const filters: FilterDescriptor[] = [
  {
    value: "status",
    text: "Status",
    multiple: true,
    choices: [
      { text: "Published", value: "published", icon: "i-lucide-circle-check" },
      { text: "Draft", value: "draft", icon: "i-lucide-pencil" },
      { text: "Archived", value: "archived", icon: "i-lucide-archive" },
    ],
  },
];

// ─── Tabs ─────────────────────────────────────────────────────────────────────
// Tabs switch a query param on the endpoint URL.
// MapoList re-fetches automatically when the active tab changes.
// In v1 you'd manage tab state in data(), watch it, and re-trigger the fetch manually.
const tabs: ListTabItem[] = [
  { text: "All", value: "" },
  { text: "Published", value: "published" },
  { text: "Drafts", value: "draft" },
  { text: "Archived", value: "archived" },
];

// ─── Bulk actions ─────────────────────────────────────────────────────────────
// In v1: a custom <v-select> wired to a Vuex action, a hand-rolled confirm dialog,
// and error handling scattered across multiple methods.
// Here: a descriptor with a handler. MapoList shows the confirm dialog, runs the
// handler, shows snack feedback, and refreshes the table — you own only the logic.
const actions: ActionDescriptor<Article>[] = [
  {
    label: "Mark as published",
    permissions: "change_article",
    handleMultiple: true,
    handler: async ({ selection }) => {
      if (!selection) return;
      await Promise.all(
        selection.map((a) =>
          $fetch(`/api/mock/articles/${a.id}`, {
            method: "PATCH",
            body: { status: "published" },
          }),
        ),
      );
    },
  },
  {
    label: "Mark as draft",
    permissions: "change_article",
    handleMultiple: true,
    handler: async ({ selection }) => {
      if (!selection) return;
      await Promise.all(
        selection.map((a) =>
          $fetch(`/api/mock/articles/${a.id}`, {
            method: "PATCH",
            body: { status: "draft" },
          }),
        ),
      );
    },
  },
];

// ─── Quick-edit fields ────────────────────────────────────────────────────────
// These fields appear in the inline modal when clicking the pencil icon on a row.
// In v1 you'd build a full ListQuickEdit.vue with a hand-rolled v-dialog + v-form.
// Here: the same FieldDescriptor syntax you already know from MapoDetail.
const quickEditFields: FieldDescriptor<Article>[] = [
  {
    key: "status",
    type: "select",
    label: "Status",
    attrs: {
      items: [
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
        { label: "Archived", value: "archived" },
      ],
    },
  },
  {
    key: "is_featured",
    type: "switch",
    label: "Featured",
  },
  {
    key: "priority",
    type: "number",
    label: "Priority",
    attrs: { min: 1, max: 100 },
  },
  {
    key: "published_at",
    type: "datetime",
    label: "Publication date",
  },
];

const listRef = ref<{ refresh: () => void } | null>(null);
</script>

<template>
  <!--
    <MapoList> is the single entry point for any list page in Mapo v2.

    What it replaces from v1:
      ✅ ListTable.vue     — server-side UTable with TanStack (was Vuetify v-data-table)
      ✅ ListFilters.vue   — filter chips + dropdown (was a hand-rolled v-navigation-drawer)
      ✅ ListActions.vue   — bulk action bar (was a custom v-select + Vuex dispatch)
      ✅ ListQuickEdit.vue — inline edit modal (was a full custom dialog per page)
      ✅ ListTabs.vue      — tab navigation with counts (was manual tab state + watchers)

    The props mirror the v1 component contracts where possible, so migration is
    mostly a find-and-replace of descriptor format, not a logic rewrite.

    Slots let you override any part:
      #head              → above the table (page title, "New" button, custom toolbar)
      #dtable.toolbar    → extra controls next to the search input
      #dtable.empty      → custom empty state
      #filter.{value}    → custom filter UI for a specific filter key
  -->
  <div class="p-6">
    <MapoList
      ref="listRef"
      endpoint="/api/mock/articles"
      detail-base="/articles"
      :columns="columns"
      :filters="filters"
      :tabs="tabs"
      tab-query-param="status"
      :actions="actions"
      :edit-fields="quickEditFields"
      lookup="id"
      :searchable="true"
    >
      <!-- #head: page title + create button. In v1 this was outside the ListTable entirely. -->
      <template #head>
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-semibold">Articles</h1>
          <UButton icon="i-lucide-plus" to="/articles/new" size="sm">
            New article
          </UButton>
        </div>
      </template>
    </MapoList>
  </div>
</template>
