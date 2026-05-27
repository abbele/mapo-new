# Field registry

The registry is the object that maps a `type` string to its Vue component. It is the extension point for adding or overriding any field type.

## Shape

```ts
interface FieldRegistry {
  // type → component (NUI string, lazy import, or imported Component)
  mapping: Record<
    string,
    string | (() => Promise<{ default: Component }>) | Component
  >;

  // default attrs per type — merged with descriptor.attrs (descriptor wins)
  attrs: Record<string, Record<string, unknown>>;

  // get/set accessor per type — to transform the value in the model
  accessor: Record<
    string,
    { get?: (v: unknown) => unknown; set?: (v: unknown) => unknown }
  >;
}
```

## Global registry (`$mapoFormRegistry`)

The `@mapomodule/form` plugin injects `$mapoFormRegistry` into `useNuxtApp()`. It contains every built-in type.

`<MapoForm>` and `<MapoDetail>` resolve this registry automatically — you do not need to pass `:registry` unless you want to swap it. The headless `useMapoForm()` composable keeps `registry` mandatory because it can be used outside Nuxt context (tests, SSR previews).

```ts
// Component path — no boilerplate
<MapoForm v-model="model" :fields="fields" />

// Headless path — explicit registry
const { $mapoFormRegistry } = useNuxtApp()
const form = useMapoForm({ model, fields, registry: $mapoFormRegistry })
```

## Add types globally — `defineFormField()` (recommended)

```ts
// app/plugins/my-fields.ts
export default defineNuxtPlugin(() => {
  defineFormField(
    "star-rating",
    () => import("~/components/StarRatingField.vue"),
    {
      attrs: { maxStars: 5, color: "amber" },
    },
  );

  // Override a built-in type — explicit opt-in to silence the warning
  defineFormField("editor", () => import("~/components/MyEditor.vue"), {
    override: true,
  });
});
```

`defineFormField()` reads `$mapoFormRegistry` from the active Nuxt app and mutates it. Re-registering an existing type prints a development warning unless `{ override: true }` is set.

## Add types globally — `nuxt.config.ts` (legacy / static)

The `nuxt.config.ts` shape still works, but only `attrs` are JSON-serializable across the runtime config boundary; `mapping` and `accessor` contain functions and must be set inside a plugin (i.e. via `defineFormField`).

```ts
// nuxt.config.ts — only attrs here
export default defineNuxtConfig({
  mapoForm: {
    fields: {
      attrs: {
        "star-rating": { maxStars: 5 },
      },
    },
  },
});
```

## Per-page registry override

To swap the registry for a single page:

```ts
const { $mapoFormRegistry } = useNuxtApp();
import StarRatingField from "~/components/StarRatingField.vue";

const localRegistry = {
  ...$mapoFormRegistry,
  mapping: {
    ...$mapoFormRegistry.mapping,
    "star-rating": StarRatingField,
  },
  attrs: {
    ...$mapoFormRegistry.attrs,
    "star-rating": { maxStars: 10 },
  },
};
```

```vue
<MapoForm :registry="localRegistry" ... />
```

## `descriptor.is` — per-field bypass

For a single field, you can pass the component directly:

```ts
import StarRatingField from "~/components/StarRatingField.vue";

const fields = [{ key: "rating", type: "star-rating", is: StarRatingField }];
```

`descriptor.is` has absolute priority over the registry for that field.

## Accessor

Accessors transform the value before it reaches the component (`get`) and after the component emits an update (`set`):

```ts
defineFormField("price-cents", () => import("~/components/PriceField.vue"), {
  accessor: {
    // Convert cents ↔ euros for display
    get: (v) => (v != null ? Number(v) / 100 : null),
    set: (v) => (v != null ? Math.round(Number(v) * 100) : null),
  },
});
```

The registry accessor can be overridden per descriptor via `descriptor.accessor`:

```ts
{ key: 'price', type: 'number', accessor: { get: (v) => v / 100, set: (v) => v * 100 } }
```

## Unknown type

If a `type` is not in the registry and the descriptor has no `is`, `MapoUnknownField` is rendered — a yellow placeholder that surfaces the missing type. The form does not break.

## Built-in defaults

| Type       | mapping                | attrs                                                      | accessor    |
| ---------- | ---------------------- | ---------------------------------------------------------- | ----------- |
| `text`     | `UInput`               | —                                                          | —           |
| `textarea` | `UTextarea`            | —                                                          | —           |
| `number`   | `UInput` (type=number) | —                                                          | —           |
| `boolean`  | `UCheckbox`            | —                                                          | —           |
| `switch`   | `USwitch`              | —                                                          | —           |
| `color`    | `UInput` (type=color)  | —                                                          | —           |
| `file`     | `UInput` (type=file)   | —                                                          | —           |
| `select`   | `USelectMenu`          | —                                                          | —           |
| `slider`   | `USlider`              | —                                                          | —           |
| `date`     | `MapoDateField`        | —                                                          | —           |
| `datetime` | `MapoDateTimeField`    | `{ tz: 'naive' }`                                          | —           |
| `time`     | `MapoTimeField`        | —                                                          | —           |
| `fks`      | `MapoFksField`         | `{ itemText: 'name', returnObject: true }`                 | —           |
| `m2m`      | `MapoFksField`         | `{ itemText: 'name', returnObject: true, multiple: true }` | —           |
| `editor`   | `MapoWygEditor`        | —                                                          | —           |
| `seo`      | `MapoSeoPreview`       | —                                                          | seo get/set |
| `map`      | `MapoMapField`         | `{ defaultLat: 0, defaultLng: 0, zoom: 8 }`                | —           |
| `repeater` | `MapoRepeater`         | `{ confirmDelete: false, allowDuplicate: false }`          | —           |
