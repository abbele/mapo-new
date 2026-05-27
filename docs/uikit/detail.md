# MapoDetail

`<MapoDetail>` is the admin record-edit shell. It owns the full CRUD lifecycle — fetch, save (PATCH or PUT), delete, validation, language tabs, unsaved-changes guard — and exposes a two-column layout (main + sticky sidebar) driven by `FieldDescriptor[]`.

## TL;DR

```vue
<script setup lang="ts">
import type { FieldDescriptor } from "@mapomodule/form";

interface Article {
  id: number;
  slug: string;
  is_active: boolean;
  translations: Record<string, { title: string; body: string }>;
}

const route = useRoute();

const mainFields: FieldDescriptor<Article>[] = [
  { key: "title", type: "text", translatable: true, required: true },
  { key: "body", type: "editor", translatable: true },
];

const sidebarFields: FieldDescriptor<Article>[] = [
  { key: "slug", type: "text", required: true },
  { key: "is_active", type: "switch", label: "Active" },
];
</script>

<template>
  <MapoDetail
    endpoint="/api/articles"
    :id="route.params.id"
    :fields="mainFields"
    :sidebar-fields="sidebarFields"
    :languages="['it', 'en']"
    model-name="Article"
  />
</template>
```

The page now supports:

- Loading the record (or a blank model when `id === 'new'`)
- Saving via PATCH (diff only) or PUT (full body), depending on `usePatch`
- Saving + continuing on the same record
- Going back without losing unsaved edits (confirmation prompt)
- Deleting with confirmation
- Switching languages with a per-language error badge
- Surfacing 400 validation errors under the right field

---

## Props

| Prop            | Type                   | Default       | Description                                      |
| --------------- | ---------------------- | ------------- | ------------------------------------------------ |
| `endpoint`      | `string`               | —             | REST endpoint for `useCrud`                      |
| `id`            | `string \| number`     | —             | Record id; pass `'new'` for create mode          |
| `fields`        | `FieldDescriptor<T>[]` | —             | Body form fields                                 |
| `sidebarFields` | `FieldDescriptor<T>[]` | `[]`          | Sidebar form fields                              |
| `languages`     | `string[]`             | `[]`          | Translation language codes (e.g. `['it', 'en']`) |
| `modelName`     | `string`               | —             | Human-readable name for the page title           |
| `sidebarCols`   | `number`               | `4`           | Sidebar column span on a 12-col grid             |
| `sticky`        | `boolean`              | `true`        | Keep the sidebar sticky while scrolling          |
| `usePatch`      | `boolean`              | `true`        | Send PATCH (diff only) on update; otherwise PUT  |
| `readonly`      | `boolean`              | `false`       | Force read-only mode                             |
| `registry`      | `FieldRegistry`        | auto-injected | Optional registry override                       |

The `registry` prop is optional — `<MapoDetail>` resolves `$mapoFormRegistry` automatically.

## Emits

| Event     | Payload         | When                      |
| --------- | --------------- | ------------------------- |
| `saved`   | the saved model | After a successful save   |
| `deleted` | —               | After a successful delete |

---

## How to: create vs edit

The component decides based on the `id` value:

```vue
<!-- Edit -->
<MapoDetail :id="route.params.id" … />

<!-- Create -->
<MapoDetail id="new" … />
```

When `id === 'new'`, `<MapoDetail>` skips the initial fetch, starts with an empty model, and submits a POST to the endpoint on save. After creation it routes to the edit URL of the new record.

## How to: split fields between main and sidebar

```ts
const mainFields: FieldDescriptor<Article>[] = [
  { key: "title", type: "text", translatable: true, required: true },
  { key: "body", type: "editor", translatable: true },
];

const sidebarFields: FieldDescriptor<Article>[] = [
  { key: "is_active", type: "switch" },
  { key: "published_at", type: "datetime" },
  { key: "category", type: "fks", attrs: { endpoint: "/api/categories/" } },
];
```

```vue
<MapoDetail
  :fields="mainFields"
  :sidebar-fields="sidebarFields"
  :sidebar-cols="3"
  …
/>
```

The split is purely visual; both groups share the same model. `getPatch()` diffs across both.

## How to: handle multilingual content

```vue
<MapoDetail :languages="['it', 'en']" :fields="mainFields" … />
```

`<MapoDetailLangSwitch>` renders above the body. Each tab shows a red error badge when at least one field inside `translations.<lang>.*` has an error. The `?lang=` query param is kept in sync — language deep-links work out of the box.

## How to: customize the sidebar buttons

The default sidebar shows Save / Save & continue / Back / Delete. Override individual buttons with the matching slot:

```vue
<MapoDetail :id="id" :fields="fields">
  <template #button-save="{ save, isSaving, isDirty }">
    <UButton :loading="isSaving" :disabled="!isDirty" color="primary" @click="save">
      Save changes
    </UButton>
  </template>

  <template #button-delete="{ deleteItem }">
    <UButton variant="ghost" color="error" @click="deleteItem">
      Move to trash
    </UButton>
  </template>
</MapoDetail>
```

Or replace the whole button block:

```vue
<template #side-buttons="{ save, isDirty, isSaving }">
  <div class="flex flex-col gap-2">
    <UButton :loading="isSaving" :disabled="!isDirty" @click="save"
      >Publish</UButton
    >
    <UButton variant="ghost" @click="$router.back()">Back to list</UButton>
  </div>
</template>
```

## How to: add custom sidebar / body sections

```vue
<MapoDetail :id="id" :fields="fields">
  <!-- Above body fields -->
  <template #body-top="{ model }">
    <UAlert v-if="model.is_outdated" color="warning" title="This article is outdated" />
  </template>

  <!-- Below body fields -->
  <template #body-bottom>
    <RelatedArticles :id="id" />
  </template>

  <!-- Sidebar header (above sidebar form) -->
  <template #side-top="{ model }">
    <UCard>
      <p class="text-sm">Author: <strong>{{ model.author_name }}</strong></p>
    </UCard>
  </template>

  <!-- Sidebar footer (below sidebar form) -->
  <template #side-bottom>
    <RevisionHistory :endpoint="`/api/articles/${id}/revisions/`" />
  </template>
</MapoDetail>
```

## How to: pass field-level slots through

`<MapoDetail>` forwards `field.<key>.*` slots to the inner `<MapoForm>` instances. Useful for any per-field customization:

```vue
<template #field.slug.append="{ model }">
  <UButton size="xs" @click="model.slug = slugify(model.title)">Auto</UButton>
</template>
```

See [Form slots](./form/slots) for the complete list.

## How to: react to save / delete

```vue
<MapoDetail
  :id="id"
  :fields="fields"
  endpoint="/api/articles/"
  @saved="onSaved"
  @deleted="onDeleted"
/>

<script setup lang="ts">
function onSaved(article: Article) {
  // e.g. invalidate a cache, push analytics
  $analytics.track("article_saved", { id: article.id });
}
function onDeleted() {
  navigateTo("/articles");
}
</script>
```

## How to: choose PATCH vs PUT

`usePatch` is `true` by default. `<MapoDetail>` sends only the diff between the loaded model and the current one (`getPatch()` from `useMapoForm`).

Disable when the backend cannot accept partial updates:

```vue
<MapoDetail :id="id" :fields="fields" :use-patch="false" />
```

---

## Slots reference

Every slot receives the same `slotBindings` object:

```ts
interface DetailSlotProps<T> {
  model: T;
  errors: Record<string, string[]>;
  currentLang: string;
  isNew: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isDirty: boolean;
  save: () => Promise<void>;
  saveAndContinue: () => Promise<void>;
  deleteItem: () => Promise<void>;
  back: () => void;
}
```

| Slot                                                                        | Replaces                                                                |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `#title`                                                                    | The page title                                                          |
| `#body`                                                                     | The entire body form (advanced — usually not needed)                    |
| `#body-lang`                                                                | The language switch above the body                                      |
| `#body-top`                                                                 | Section above the body fields                                           |
| `#body-bottom`                                                              | Section below the body fields                                           |
| `#side-buttons`                                                             | The whole sidebar button stack                                          |
| `#button-save` / `#button-savecontinue` / `#button-back` / `#button-delete` | Single buttons                                                          |
| `#side-top`                                                                 | Section above the sidebar form                                          |
| `#side-bottom`                                                              | Section below the sidebar form                                          |
| `#field.<key>.*`                                                            | Forwarded to `<MapoForm>` (label, append, prepend, hint, before, after) |

## Pitfalls

- **`id` prop expects `'new'`, not `0` or `null`** — for create mode, pass the literal string. Nuxt's route param will already be `'new'` if you wire the URL as `/articles/new`.
- **PATCH semantics** — the diff is computed against the snapshot taken at fetch time. If something else mutates `model` outside `<MapoDetail>` (e.g. a parent component), the diff may include unintended changes.
- **Leaving with unsaved edits** — the guard hooks both `onBeforeRouteLeave` and `window.beforeunload`. Avoid replacing `<MapoDetail>` in tests with a stub that does not propagate the `isDirty` state, or you will lose the warning.
- **Sidebar errors** — sidebar fields share the same error map as the body. A 400 on a sidebar field renders inside the sidebar form, not the body — keep the descriptor `key` consistent with the API payload so the matcher finds it.
