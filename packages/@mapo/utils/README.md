# @mapomodule/utils

Typed utility helpers shared across all `@mapomodule/*` packages.

## Utilities

| Export           | Description                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `deepMerge`      | Recursively merges two plain objects                                                                       |
| `getNestedValue` | Reads a value from a dotted path (e.g. `"user.address.city"`)                                              |
| `setNestedValue` | Returns a new object with a value set at a dotted path                                                     |
| `objectDiff`     | Returns only the keys that differ between two objects — used for differential PATCH requests               |
| `formatDate`     | Formats a `Date` or ISO string with a token-based format string (`YYYY`, `MM`, `DD`, `HH`, `mm`, `ss`)     |
| `debounce`       | Returns a debounced version of a function                                                                  |
| `slotNamespace`  | Filters and strips a prefix from a Vue `Slots` object — used to forward a slot subset to a child component |
| `buildRouteTree` | Converts a flat `RouteRecordNormalized[]` into a nested `MenuNode[]` tree for sidebar rendering            |

## Installation

```bash
pnpm add @mapomodule/utils
```

---

> The helpers in this package are ported from the Mapo v1 legacy codebase. As v2 development progresses, individual helpers may be added, removed, or replaced — and the package itself may be dissolved if its contents are better placed elsewhere.
