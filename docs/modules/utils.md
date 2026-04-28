# @mapomodule/utils

Pure TypeScript utility helpers shared across all `@mapomodule/*` packages. No Vue, no Nuxt, no side effects — safe to import from any context including server-only code and tests.

## Installation

```bash
pnpm add @mapomodule/utils
```

---

## `normalizeEndpoint(endpoint)`

Ensures an API endpoint string has exactly one leading slash and one trailing slash. Used internally by `useCrud` to normalize user-provided paths before making requests.

```ts
import { normalizeEndpoint } from "@mapomodule/utils";

normalizeEndpoint("api/articles"); // '/api/articles/'
normalizeEndpoint("/api/articles"); // '/api/articles/'
normalizeEndpoint("/api/articles/"); // '/api/articles/'
normalizeEndpoint("///api/articles"); // '/api/articles/'
```

---

## `deepMerge(target, source)`

Recursively merges two plain objects. Arrays and primitives in `source` overwrite those in `target`; nested objects are merged recursively.

```ts
import { deepMerge } from "@mapomodule/utils";

deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } });
// → { a: 1, b: { c: 2, d: 3 } }
```

---

## `getNestedValue(obj, path)` / `setNestedValue(obj, path, value)`

Read or write a value at a dotted path string.

```ts
import { getNestedValue, setNestedValue } from "@mapomodule/utils";

const obj = { user: { address: { city: "Rome" } } };

getNestedValue(obj, "user.address.city"); // 'Rome'
setNestedValue(obj, "user.address.city", "Milan");
// → { user: { address: { city: 'Milan' } } }
```

---

## `objectDiff(original, updated)`

Returns only the keys whose values differ between two objects. Used by `useCrud.partialUpdate` to send minimal PATCH payloads.

```ts
import { objectDiff } from "@mapomodule/utils";

objectDiff({ title: "Old", body: "Text" }, { title: "New", body: "Text" });
// → { title: 'New' }
```

---

## `formatDate(date, format?)`

Formats a `Date` object or ISO string using a token-based format string.

| Token  | Value               |
| ------ | ------------------- |
| `YYYY` | 4-digit year        |
| `MM`   | 2-digit month       |
| `DD`   | 2-digit day         |
| `HH`   | 2-digit hours (24h) |
| `mm`   | 2-digit minutes     |
| `ss`   | 2-digit seconds     |

```ts
import { formatDate } from "@mapomodule/utils";

formatDate(new Date("2026-04-28T10:30:00"), "YYYY-MM-DD"); // '2026-04-28'
formatDate("2026-04-28T10:30:00", "DD/MM/YYYY HH:mm"); // '28/04/2026 10:30'
```

---

## `debounce(fn, delay)`

Returns a debounced version of `fn` that delays invocation until `delay` ms have elapsed since the last call.

```ts
import { debounce } from "@mapomodule/utils";

const onSearch = debounce((query: string) => fetchResults(query), 300);
```

---

## `slotNamespace(slots, prefix)`

Filters a Vue `Slots` object to only those whose names start with `prefix`, and strips the prefix from each key. Used to forward a slot subset to a child component.

```ts
import { slotNamespace } from "@mapomodule/utils";

// Parent has slots: 'header', 'list:empty', 'list:item'
const listSlots = slotNamespace(slots, "list:");
// → { empty: ..., item: ... }
```

---

## `buildRouteTree(routes)`

Converts a flat `RouteRecordNormalized[]` array into a nested `MenuNode[]` tree, using `route.meta.parent` to establish parent–child relationships. Used by the sidebar to build the navigation tree.

```ts
import { buildRouteTree } from "@mapomodule/utils";
import type { MenuNode } from "@mapomodule/utils";

const tree: MenuNode[] = buildRouteTree(router.getRoutes());
```
