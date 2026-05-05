# Form Engine — Component API Reference

Complete props, emits, slots, and exposed methods for all Form Engine components and field types.

---

## MapoForm

The main form renderer. Takes a list of `FieldDescriptor` objects and a model, then renders the appropriate field components.

### Props

| Prop          | Type                       | Default        | Description                                                                  |
| ------------- | -------------------------- | -------------- | ---------------------------------------------------------------------------- |
| `modelValue`  | `T`                        | — **required** | The form data object (v-model).                                              |
| `fields`      | `FieldDescriptor<T>[]`     | — **required** | Array of field descriptors defining the form layout.                         |
| `errors`      | `Record<string, string[]>` | `{}`           | Server-side validation errors keyed by field path.                           |
| `languages`   | `string[]`                 | `[]`           | Available language codes for translated fields.                              |
| `currentLang` | `string`                   | `''`           | Active language code. Controlled externally (by `MapoDetail`).               |
| `readonly`    | `boolean`                  | `false`        | Make all fields read-only.                                                   |
| `immediate`   | `boolean`                  | `false`        | Run client validators immediately without waiting for the first submit.      |
| `registry`    | `FieldRegistry`            | —              | Field component registry. Auto-injected from `$mapoFormRegistry` if omitted. |

### Emits

| Event               | Payload | Description                         |
| ------------------- | ------- | ----------------------------------- |
| `update:modelValue` | `T`     | Emitted whenever any field changes. |

### Slots

| Slot          | Description                                                                        |
| ------------- | ---------------------------------------------------------------------------------- |
| `field.{key}` | Override the rendering of a specific field. Receives `{ field: FieldDescriptor }`. |

### Exposed Methods

| Method           | Signature             | Description                                                 |
| ---------------- | --------------------- | ----------------------------------------------------------- |
| `submit`         | `() => Promise<void>` | Run all validators and mark the form as submitted.          |
| `validateClient` | `() => boolean`       | Run client-side validators only. Returns `true` if valid.   |
| `resetDirty`     | `() => void`          | Reset the dirty-tracking baseline (call after a save).      |
| `getPatch`       | `() => Partial<T>`    | Return only the fields changed since the last `resetDirty`. |
| `isDirty`        | `Ref<boolean>`        | Reactive flag indicating unsaved changes.                   |
| `isLoading`      | `Ref<boolean>`        | Reactive flag while async validators are running.           |

---

## MapoFormField

Low-level wrapper that resolves a `FieldDescriptor` to its registered component, handles label, hints, errors, and slot injection.

### Props

| Prop         | Type              | Default        | Description                     |
| ------------ | ----------------- | -------------- | ------------------------------- |
| `descriptor` | `FieldDescriptor` | — **required** | The field configuration object. |

### Slots

| Slot                  | Description                                                            |
| --------------------- | ---------------------------------------------------------------------- |
| `field.{key}.label`   | Override the field label. Receives `{ descriptor, label }`.            |
| `field.{key}.before`  | Content rendered before the field wrapper. Receives `{ descriptor }`.  |
| `field.{key}.prepend` | Content prepended inside the field control. Receives `{ descriptor }`. |
| `field.{key}.append`  | Content appended inside the field control. Receives `{ descriptor }`.  |
| `field.{key}.hint`    | Override the hint text. Receives `{ descriptor }`.                     |
| `field.{key}.after`   | Content rendered after the field wrapper. Receives `{ descriptor }`.   |

---

## MapoFormGroup

Collapsible section that groups related fields under a heading.

### Props

| Prop              | Type                | Default        | Description                        |
| ----------------- | ------------------- | -------------- | ---------------------------------- |
| `name`            | `string`            | — **required** | Group identifier.                  |
| `label`           | `string`            | —              | Group heading label.               |
| `fields`          | `FieldDescriptor[]` | — **required** | Fields belonging to this group.    |
| `initialExpanded` | `boolean`           | —              | Whether the group starts expanded. |

---

## MapoFormTabs

Tab-based layout for organizing fields into named sections.

### Props

| Prop   | Type         | Default        | Description                                          |
| ------ | ------------ | -------------- | ---------------------------------------------------- |
| `tabs` | `TabEntry[]` | — **required** | Tab definitions. Each entry has `{ label, fields }`. |

---

## MapoFocusPortal

Full-screen overlay for editing a Repeater item in focus mode. Mount once inside your default layout.

### Props / Emits / Slots

None — controlled internally by `MapoRepeater` via a shared provide/inject.

---

## MapoUnknownField

Fallback field rendered when no matching component is found in the registry.

### Props

| Prop         | Type              | Default        | Description                |
| ------------ | ----------------- | -------------- | -------------------------- |
| `modelValue` | `unknown`         | — **required** | Current value.             |
| `descriptor` | `FieldDescriptor` | — **required** | Field descriptor.          |
| `errors`     | `string[]`        | —              | Validation error messages. |
| `readonly`   | `boolean`         | —              | Read-only mode.            |
| `disabled`   | `boolean`         | —              | Disabled mode.             |

### Emits

| Event               | Payload   | Description              |
| ------------------- | --------- | ------------------------ |
| `update:modelValue` | `unknown` | Emitted on value change. |

---

## Field Components

All field components share the same base interface:

```ts
Props: { modelValue, descriptor, errors?, readonly?, disabled? }
Emits: { 'update:modelValue': value }
```

### MapoDateField

Date-only picker. Serializes as `YYYY-MM-DD`.

| Prop         | Type             | Description                |
| ------------ | ---------------- | -------------------------- |
| `modelValue` | `unknown`        | ISO date string or `null`. |
| `descriptor` | `DateDescriptor` | Field configuration.       |

### MapoTimeField

Time-only picker. Emits `HH:MM` format.

| Prop         | Type             | Description            |
| ------------ | ---------------- | ---------------------- |
| `modelValue` | `unknown`        | Time string or `null`. |
| `descriptor` | `DateDescriptor` | Field configuration.   |

### MapoDateTimeField

Combined date + time picker with optional timezone handling (`naive` / `UTC`).

| Prop         | Type             | Description                                             |
| ------------ | ---------------- | ------------------------------------------------------- |
| `modelValue` | `unknown`        | ISO datetime string or `null`.                          |
| `descriptor` | `DateDescriptor` | Field configuration. `attrs.tz` controls timezone mode. |

#### `descriptor.attrs`

| Key  | Type               | Default   | Description             |
| ---- | ------------------ | --------- | ----------------------- |
| `tz` | `'naive' \| 'UTC'` | `'naive'` | Timezone handling mode. |

---

### MapoSeoPreview

SEO metadata editor with live SERP preview.

| Prop         | Type            | Description                            |
| ------------ | --------------- | -------------------------------------- |
| `modelValue` | `unknown`       | `{ title?, description?, permalink? }` |
| `descriptor` | `SeoDescriptor` | Field configuration.                   |

---

### MapoWygEditor

WYSIWYG rich-text editor powered by TipTap. Output is sanitized HTML.

| Prop         | Type               | Description          |
| ------------ | ------------------ | -------------------- |
| `modelValue` | `unknown`          | HTML string.         |
| `descriptor` | `EditorDescriptor` | Field configuration. |

---

### MapoMapField

Geographic coordinate picker with a Leaflet map and manual lat/lng inputs.

| Prop         | Type            | Description                            |
| ------------ | --------------- | -------------------------------------- |
| `modelValue` | `unknown`       | `{ lat: number, lng: number } \| null` |
| `descriptor` | `MapDescriptor` | Field configuration.                   |

#### `descriptor.attrs`

| Key          | Type     | Default | Description                                 |
| ------------ | -------- | ------- | ------------------------------------------- |
| `defaultLat` | `number` | `41.9`  | Initial map latitude when no value is set.  |
| `defaultLng` | `number` | `12.5`  | Initial map longitude when no value is set. |
| `zoom`       | `number` | `6`     | Initial map zoom level.                     |

---

### MapoFksField

Foreign key selector with remote search. Supports single and multi-select.

| Prop         | Type            | Description                                     |
| ------------ | --------------- | ----------------------------------------------- |
| `modelValue` | `unknown`       | Selected item object, array of items, or ID(s). |
| `descriptor` | `FksDescriptor` | Field configuration.                            |

#### `descriptor.attrs`

| Key            | Type      | Default        | Description                                  |
| -------------- | --------- | -------------- | -------------------------------------------- |
| `endpoint`     | `string`  | — **required** | API endpoint for option search.              |
| `itemText`     | `string`  | `'name'`       | Model field to display as label.             |
| `itemValue`    | `string`  | `'id'`         | Model field to use as value.                 |
| `multiple`     | `boolean` | `false`        | Allow multi-selection.                       |
| `returnObject` | `boolean` | `true`         | Emit the full object instead of only the ID. |

---

### MapoRepeater

Dynamic list field with drag-and-drop reordering, bulk selection, duplication, and focus mode.

| Prop         | Type                 | Description            |
| ------------ | -------------------- | ---------------------- |
| `modelValue` | `unknown`            | Array of item objects. |
| `descriptor` | `RepeaterDescriptor` | Field configuration.   |

#### `descriptor.attrs`

| Key                 | Type                                                         | Default | Description                                                      |
| ------------------- | ------------------------------------------------------------ | ------- | ---------------------------------------------------------------- |
| `templates`         | `Record<string, FieldDescriptor[]>`                          | —       | Named field templates (one per item type).                       |
| `previewLabel`      | `(item) => string`                                           | —       | Callback to generate an item's collapsed preview label.          |
| `defaultExpanded`   | `boolean`                                                    | `false` | Start all items expanded.                                        |
| `allowDuplicate`    | `boolean`                                                    | `true`  | Show the Duplicate action on each item.                          |
| `minItems`          | `number`                                                     | —       | Minimum number of items (validated on submit).                   |
| `maxItems`          | `number`                                                     | —       | Maximum number of items (Add button hidden when reached).        |
| `confirmDelete`     | `boolean`                                                    | `true`  | Show a confirmation dialog before deleting an item.              |
| `miniCard`          | `(item, idx) => { title, subtitle, thumbnail, statusColor }` | —       | Config for the compressed mini-card view.                        |
| `compressThreshold` | `number`                                                     | `3`     | Number of items above which the list switches to mini-card view. |

---

## MapoRepeaterItem

Single item inside a `MapoRepeater`. Handles both full-form and mini-card views.

### Props

| Prop                 | Type                       | Default        | Description                                        |
| -------------------- | -------------------------- | -------------- | -------------------------------------------------- |
| `item`               | `Record<string, unknown>`  | — **required** | Item data.                                         |
| `fields`             | `FieldDescriptor[]`        | — **required** | Item form fields.                                  |
| `index`              | `number`                   | — **required** | Item index in the parent array.                    |
| `errorPrefix`        | `string`                   | — **required** | Error key prefix (e.g. `'items.0'`).               |
| `parentErrors`       | `Record<string, string[]>` | — **required** | Errors from the parent form.                       |
| `languages`          | `string[]`                 | — **required** | Language codes.                                    |
| `currentLang`        | `string`                   | — **required** | Active language.                                   |
| `readonly`           | `boolean`                  | — **required** | Read-only mode.                                    |
| `registry`           | `FieldRegistry`            | — **required** | Field registry.                                    |
| `previewLabel`       | `(item) => string`         | —              | Callback to generate the collapsed preview label.  |
| `defaultExpanded`    | `boolean`                  | — **required** | Initial expanded state.                            |
| `allowDuplicate`     | `boolean`                  | —              | Show Duplicate action.                             |
| `repeaterDescriptor` | `RepeaterDescriptor`       | —              | Parent repeater descriptor (for mini-card config). |
| `totalItems`         | `number`                   | —              | Total number of items in the parent repeater.      |
| `selected`           | `boolean`                  | —              | Whether this item is bulk-selected.                |
| `selectionMode`      | `boolean`                  | —              | Whether bulk selection mode is active.             |

### Emits

| Event           | Payload                   | Description                         |
| --------------- | ------------------------- | ----------------------------------- |
| `update:item`   | `Record<string, unknown>` | Item data changed.                  |
| `delete`        | —                         | Delete this item.                   |
| `duplicate`     | —                         | Duplicate this item.                |
| `move-up`       | —                         | Move this item one position up.     |
| `move-down`     | —                         | Move this item one position down.   |
| `move-to`       | `index: number`           | Move this item to a specific index. |
| `toggle-select` | —                         | Toggle bulk-selection of this item. |

### Slots

| Slot      | Description                                |
| --------- | ------------------------------------------ |
| `actions` | Custom action buttons in the item toolbar. |

---

## NUI Wrapper Fields

Thin wrappers around Nuxt UI primitives that integrate with the form registry system. They inherit all attributes and props from the underlying Nuxt UI component.

| Component       | Wraps         | Registry key                                       |
| --------------- | ------------- | -------------------------------------------------- |
| `NuiInput`      | `UInput`      | `'text'`, `'char'`, `'email'`, `'url'`, `'number'` |
| `NuiTextarea`   | `UTextarea`   | `'textarea'`                                       |
| `NuiSlider`     | `USlider`     | `'slider'`                                         |
| `NuiCheckbox`   | `UCheckbox`   | `'checkbox'`, `'boolean'`                          |
| `NuiSelectMenu` | `USelectMenu` | `'select'`                                         |
| `NuiSwitch`     | `USwitch`     | `'switch'`                                         |
