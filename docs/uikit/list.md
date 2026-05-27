# MapoList

`<MapoList>` is the admin data-table shell. It wires together pagination, search, filters, tabs, bulk actions, drag reorder, and an inline quick-edit modal — all driven by the same descriptors you use elsewhere (CRUD endpoint, column definitions, `FieldDescriptor[]`).

## TL;DR

```vue
<script setup lang="ts">
import type {
  ListColumn,
  FilterDescriptor,
  ActionDescriptor,
  ListTabItem,
} from "@mapomodule/uikit";
import type { FieldDescriptor } from "@mapomodule/form";

interface News {
  id: number;
  title: string;
  status: string;
  published_at: string;
}

const columns: ListColumn[] = [
  { key: "title", label: "Title", sortable: true },
  { key: "status", label: "Status" },
  { key: "published_at", label: "Published", sortable: true },
];

const filters: FilterDescriptor[] = [
  {
    value: "status",
    text: "Status",
    choices: [
      { text: "Draft", value: "draft" },
      { text: "Published", value: "published" },
    ],
  },
];

const quickEdit: FieldDescriptor<News>[] = [
  { key: "status", type: "select", attrs: { options: filters[0].choices } },
];
</script>

<template>
  <MapoList
    endpoint="/api/models/news/"
    :columns="columns"
    :filters="filters"
    :edit-fields="quickEdit"
    detail-base="/news"
    lookup="id"
  />
</template>
```

That single component renders a paginated table, a search input, a filter dropdown, a quick-edit pencil button per row, and a "view detail" link per row — without writing any sub-component.

---

## Props

| Prop            | Type                     | Default      | Description                                                           |
| --------------- | ------------------------ | ------------ | --------------------------------------------------------------------- |
| `endpoint`      | `string`                 | —            | REST collection endpoint (passed to `useCrud`)                        |
| `columns`       | `ListColumn[]`           | —            | Column definitions                                                    |
| `lookup`        | `string`                 | `'id'`       | Key used as primary key (selection, links, drag)                      |
| `filters`       | `FilterDescriptor[]`     | `[]`         | Filter dropdown items                                                 |
| `actions`       | `ActionDescriptor<T>[]`  | `[]`         | Bulk actions shown when rows are selected                             |
| `tabs`          | `ListTabItem[]`          | `[]`         | Status / segment tab bar                                              |
| `defaultTab`    | `string`                 | first tab    | Active tab on mount                                                   |
| `tabQueryParam` | `string`                 | `'tab'`      | Query param used when fetching with a tab                             |
| `searchable`    | `boolean`                | `true`       | Show the search input                                                 |
| `draggable`     | `boolean`                | `false`      | Enable drag-reorder rows                                              |
| `positionField` | `string`                 | `'position'` | Field used for ordering                                               |
| `editFields`    | `FieldDescriptor<T>[]`   | `[]`         | Inline quick-edit modal field list                                    |
| `languages`     | `string[]`               | —            | Languages for translatable quick-edit fields                          |
| `registry`      | `Partial<FieldRegistry>` | —            | Optional registry override (auto-injected otherwise)                  |
| `detailBase`    | `string`                 | —            | If set, each row shows a link button → `${detailBase}/${row[lookup]}` |

The `registry` prop is **optional** — `<MapoList>` falls back to the global `$mapoFormRegistry` automatically.

## Sub-components

`<MapoList>` is a thin orchestrator. The real work is split across:

- `<MapoListHead>` — page-level header slot
- `<MapoListTabs>` — tab bar
- `<MapoListFilters>` — filter dropdown + active chips
- `<MapoListActions>` — bulk action menu
- `<MapoListTable>` — the actual `UTable` (selection, sorting, pagination, drag, quick-edit trigger)
- `<MapoListQuickEdit>` — modal driven by `editFields`

You can compose them directly when you need a custom layout — the props mirror `<MapoList>`'s.

---

## How to: define columns

```ts
const columns: ListColumn[] = [
  { key: "title", label: "Title", sortable: true },
  { key: "status", label: "Status" },
  {
    key: "published_at",
    label: "Published",
    sortable: true,
    class: "text-right",
  },
];
```

| Field      | Description                                                |
| ---------- | ---------------------------------------------------------- |
| `key`      | Property name on the row object                            |
| `label`    | Header text                                                |
| `sortable` | Adds a sort handle (server-side ordering via `?ordering=`) |
| `class`    | CSS class applied to the `<td>`                            |

## How to: customize a cell

Use the per-cell slot `#cell.<key>` — it receives `{ row }`:

```vue
<MapoList :columns="columns" :endpoint="…">
  <template #cell.status="{ row }">
    <UBadge :color="row.status === 'published' ? 'success' : 'neutral'">
      {{ row.status }}
    </UBadge>
  </template>

  <template #cell.published_at="{ row }">
    {{ formatDate(row.published_at) }}
  </template>
</MapoList>
```

The slot system propagates from `<MapoList>` down to `<MapoListTable>` automatically.

## How to: add filters

```ts
const filters: FilterDescriptor[] = [
  {
    value: "status", // query param sent to backend
    text: "Status",
    multiple: true, // multi-select (default: single)
    choices: [
      { text: "Draft", value: "draft", icon: "i-lucide-edit" },
      { text: "Published", value: "published", icon: "i-lucide-globe" },
    ],
    defaultChoice: "draft", // pre-selected on mount
  },
  {
    value: "date_range",
    text: "Date",
    datepicker: true, // renders a date range picker
  },
];
```

Filters are sent as request parameters — never concatenated into the endpoint string. Selecting a filter triggers a refetch via `crud.list(params)`.

## How to: add bulk actions

```ts
const actions: ActionDescriptor<News>[] = [
  {
    label: "Publish",
    handleMultiple: true, // available with row-level selection
    handleAll: false, // not available for select-all
    permissions: "publish_news", // optional permission gate
    async handler({ selection }) {
      if (!selection) return;
      await Promise.all(
        selection.map((row) =>
          $fetch(`/api/news/${row.id}/publish/`, { method: "POST" }),
        ),
      );
    },
  },
];
```

After the handler resolves, `<MapoList>` refreshes the table automatically.

`ActionContext` shape:

```ts
interface ActionContext<T> {
  selection: T[] | null; // null when "all" is selected
  selectionQuery: URLSearchParams; // current query (page_size, search, ordering) — useful for "all"
  lookup: string;
}
```

## How to: tab between segments

```ts
const tabs: ListTabItem[] = [
  { text: "All", value: "all" },
  { text: "Draft", value: "draft", count: 12 },
  { text: "Published", value: "published", count: 145 },
];
```

```vue
<MapoList
  endpoint="/api/news/"
  :columns="columns"
  :tabs="tabs"
  default-tab="all"
  tab-query-param="status"   <!-- ?status=draft -->
/>
```

The active tab is appended to the endpoint as a query param. Switching tabs clears the current selection and refetches.

## How to: enable inline quick-edit

```ts
const quickEdit: FieldDescriptor<News>[] = [
  { key: "status", type: "select", attrs: { options: statuses } },
  { key: "published_at", type: "datetime" },
];
```

```vue
<MapoList :edit-fields="quickEdit" :endpoint="…" :columns="…" />
```

A pencil icon now appears on every row. Click it → the modal renders a `<MapoForm>` populated with the row data. Save sends a PATCH for the listed fields only and refreshes the row.

## How to: enable drag reorder

```vue
<MapoList draggable position-field="position" :endpoint="…" :columns="…" />
```

The drag uses `crud.updateOrder(movedId, targetId)` — a single request. The backend (e.g. Camomilla) recomputes positions; the client does not fire one PATCH per moved item, avoiding race conditions and order inversions.

## How to: link rows to a detail page

```vue
<MapoList detail-base="/news" :endpoint="…" :columns="…" />
```

A link icon appears on each row pointing at `/news/${row[lookup]}`. Combine with `<MapoDetail>` for the matching edit page.

---

## Slots

| Slot                  | Source              | Receives            |
| --------------------- | ------------------- | ------------------- |
| `#head`               | `<MapoListHead>`    | —                   |
| `#cell.<key>`         | `<MapoListTable>`   | `{ row }`           |
| `#head.<key>`         | `<MapoListTable>`   | `{ column }`        |
| Filter custom widgets | `<MapoListFilters>` | (forwarded by name) |

All slots are forwarded transparently from `<MapoList>` to its sub-components.

## Pitfalls

- **Selection survives reload only with `lookup`** — the table keys selection by `row[lookup]`. If your model uses `slug` or a UUID instead of `id`, set `lookup` accordingly.
- **`tabQueryParam` collides with filters** — if your backend uses the same key both as a tab segment and a filter, the tab wins. Pick a different filter `value`.
- **Bulk actions on `selection: 'all'`** — when the user selects "all rows across pages", `selection` is `null`. Use `selectionQuery` to stream a server-side bulk endpoint, do not fetch every row client-side.
- **`columns[].class` must be static** — Tailwind v4 requires literal class names; `:class="dynamic"` does not work in column defs.
