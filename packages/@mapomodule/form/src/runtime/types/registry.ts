import type { Component } from "vue";
import type { FieldDescriptor, FieldAccessor } from "./descriptor.js";

/**
 * Accepted values for a registry entry:
 * - `string` — Nuxt UI component name, resolved at runtime via `resolveComponent()`
 * - `Component` — synchronous Vue component object
 * - `() => Promise<{ default: Component }>` — async lazy import
 */
export type FieldComponentEntry =
  | string
  | Component
  | (() => Promise<{ default: Component }>);

/** The global form field registry injected as `$mapoFormRegistry`. */
export interface FieldRegistry {
  /** Maps a field `type` string to its component entry. */
  mapping: Record<string, FieldComponentEntry>;
  /**
   * Default `attrs` merged into every field of the given type.
   * The special key `'All'` is applied to all field types.
   */
  attrs: Record<string, Record<string, unknown>>;
  /** Default `get`/`set` accessor applied per field type. */
  accessor: Record<string, FieldAccessor>;
}

/**
 * Partial version of {@link FieldRegistry} for consumer overrides
 * (e.g. `mapoForm.fields` in `nuxt.config`).
 */
export type PartialFieldRegistry = {
  mapping?: Partial<FieldRegistry["mapping"]>;
  attrs?: Partial<FieldRegistry["attrs"]>;
  accessor?: Partial<FieldRegistry["accessor"]>;
};

/**
 * Resolves the component entry for a given field descriptor.
 * Returns the `descriptor.is` override if set, otherwise looks up `registry.mapping`.
 */
export function resolveFieldComponent(
  descriptor: FieldDescriptor,
  registry: FieldRegistry,
): FieldComponentEntry | null {
  if (descriptor.is) return descriptor.is;
  return registry.mapping[descriptor.type] ?? null;
}

/**
 * Merges the registry-level default attrs for a field type with the descriptor's own `attrs`.
 * The `'All'` key in `registry.attrs` is applied first, then the type-specific key.
 */
export function resolveFieldAttrs(
  descriptor: FieldDescriptor,
  registry: FieldRegistry,
): Record<string, unknown> {
  const allAttrs = registry.attrs["All"] ?? {};
  const typeAttrs = registry.attrs[descriptor.type] ?? {};
  return { ...allAttrs, ...typeAttrs, ...(descriptor.attrs ?? {}) };
}

/**
 * Merges the registry-level default accessor for a field type with the descriptor's own `accessor`.
 */
export function resolveFieldAccessor(
  descriptor: FieldDescriptor,
  registry: FieldRegistry,
): FieldAccessor {
  const typeAccessor = registry.accessor[descriptor.type] ?? {};
  return { ...typeAccessor, ...(descriptor.accessor ?? {}) };
}
