# `useMapoForm()` — Reference

The headless composable that owns every piece of form logic. Use it without `<MapoForm>` for fully custom layouts.

## Signature

```ts
const form = useMapoForm<T>({
  model:        Ref<T>,
  fields:       MaybeRef<FieldDescriptor<T>[]>,
  errors?:      Ref<Record<string, string[]>>,   // backend errors
  languages?:   string[],
  currentLang?: Ref<string>,
  immediate?:   boolean,        // true = no debounce
  debounce?:    number,         // ms, default 300
  registry:     FieldRegistry,
})
```

`registry` is required — `useMapoForm()` is the headless entry point and may be invoked in environments where `useNuxtApp()` is not available (tests, SSR previews). The component-level `<MapoForm>` falls back to `$mapoFormRegistry` automatically.

## Returns

| Property / Method           | Type                                                            | Description                                           |
| --------------------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| `state`                     | `ComputedRef<{model, errors, isDirty, currentLang, isLoading}>` | Reactive snapshot of the form state                   |
| `isDirty`                   | `Ref<boolean>`                                                  | `true` when the model differs from the backup         |
| `isLoading`                 | `Ref<boolean>`                                                  | `true` while `submit()` is running                    |
| `currentLang`               | `Ref<string>`                                                   | Active language (synced through provide/inject)       |
| `readonly`                  | `Ref<boolean>`                                                  | Toggle to lock every field                            |
| `getFieldValue(descriptor)` | `unknown`                                                       | Current value with `accessor.get` applied             |
| `setFieldValue(key, val)`   | `void`                                                          | Updates the model (with `initLang` if `translatable`) |
| `getClientError(key)`       | `string \| null`                                                | Error from `descriptor.validate()`                    |
| `validateClient()`          | `{ valid, errors }`                                             | Runs every `validate()`                               |
| `resetDirty()`              | `void`                                                          | Clears the backup (after a successful save)           |
| `getPatch()`                | `Partial<T>`                                                    | Diff model vs backup — for differential PATCH         |
| `submit(handler, isNew?)`   | `Promise<void>`                                                 | Validate, call handler, manage loading state          |
| `provideContext()`          | `void`                                                          | Inject the context for nested `<MapoFormField>`       |

## Headless usage

```vue
<script setup lang="ts">
const model = ref({ title: "", status: "draft" });
const { $mapoFormRegistry } = useNuxtApp();
const fields = ref([
  { key: "title", type: "text" as const, required: true },
  {
    key: "status",
    type: "select" as const,
    attrs: { options: [{ text: "Draft", value: "draft" }] },
  },
]);

const form = useMapoForm({
  model,
  fields,
  registry: $mapoFormRegistry,
  immediate: true,
});

// REQUIRED if you render individual <MapoFormField> without <MapoForm>
form.provideContext();

async function save() {
  await form.submit(async (patch) => {
    await $fetch("/api/articles/1/", { method: "PATCH", body: patch });
  });
}
</script>

<template>
  <!-- Fully custom layout -->
  <div class="grid grid-cols-2 gap-4">
    <MapoFormField :descriptor="fields[0]" />
    <MapoFormField :descriptor="fields[1]" />
  </div>
  <div class="mt-4 flex justify-between">
    <span>Dirty: {{ form.isDirty.value }}</span>
    <UButton :loading="form.isLoading.value" @click="save">Save</UButton>
  </div>
</template>
```

## `submit()`

```ts
await form.submit(handler, isNew?)
```

- If `validateClient()` fails → `handler` is not called and `isLoading` is not flipped
- If `isNew = true` → `handler` receives the full model
- If `isNew = false` (default) → `handler` receives `getPatch()` only
- After `handler` resolves → `resetDirty()` is called automatically
- `isLoading` is `true` while `handler` is running

```ts
await form.submit(async (data, isNew) => {
  if (isNew) {
    await $fetch("/api/articles/", { method: "POST", body: data });
  } else {
    await $fetch(`/api/articles/${id}/`, { method: "PATCH", body: data });
  }
});
```

## `MapoFormContext` (inject in child fields)

Every component inside a `<MapoForm>` (or after a `provideContext()` call) can read the context:

```ts
const form = injectMapoForm<Article>();
// form?.model, form?.errors, form?.currentLang, form?.registry, ...
```
