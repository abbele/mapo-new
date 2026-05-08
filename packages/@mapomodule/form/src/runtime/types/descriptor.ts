import type { Component } from "vue";

/** Lookup table for decrementing depth at compile time. */
type Prev = [never, 0, 1, 2, 3, 4];

/**
 * Recursively builds all valid dotted-path keys of T up to depth D.
 * Arrays are not expanded — repeater items declare their own nested `fields`.
 * When T is the default `Record<string, unknown>`, this resolves to `string`
 * so untyped field arrays remain unconstrained.
 */
export type DeepKeyOf<T, D extends number = 4> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T & string]:
          | K
          | (NonNullable<T[K]> extends unknown[]
              ? never
              : NonNullable<T[K]> extends object
                ? `${K}.${DeepKeyOf<NonNullable<T[K]>, Prev[D]>}`
                : never);
      }[keyof T & string]
    : never;

/**
 * All field types recognised by the default Mapo form registry.
 * Use {@link FieldType} when you need to accept custom (string) types too.
 */
export enum KnownFieldType {
  Text = "text",
  Textarea = "textarea",
  Number = "number",
  Boolean = "boolean",
  Switch = "switch",
  Slider = "slider",
  Color = "color",
  File = "file",
  Select = "select",
  Fks = "fks",
  M2m = "m2m",
  Date = "date",
  Time = "time",
  Datetime = "datetime",
  Editor = "editor",
  Seo = "seo",
  Map = "map",
  Repeater = "repeater",
  Media = "media",
  MediaM2m = "media-m2m",
  EnhancedMedia = "enhanced-media",
}

/**
 * Accepts any {@link KnownFieldType} value **or** an arbitrary string for custom types
 * registered by the consumer via `defineFormField()` or `nuxt.config`.
 */
export type FieldType = `${KnownFieldType}` | (string & {});

/**
 * Custom get/set accessor pair for a field.
 * Use this to redirect reads/writes to a different model path or to apply
 * a transformation (e.g. serialise a Date object to an ISO string).
 */
export interface FieldAccessor<TValue = unknown, TModel = unknown> {
  get?: (ctx: { model: TModel; val: TValue; lang?: string }) => TValue;
  set?: (ctx: { model: TModel; val: TValue; lang?: string }) => TValue;
}

/**
 * Common properties shared by every field descriptor.
 * All concrete descriptor types extend this interface.
 */
interface FieldBase<T> {
  /** Model key. Accepts a direct `keyof T` or a dotted path up to 4 levels deep (e.g. `"data.hero.title"`). */
  key: DeepKeyOf<T>;
  /** Human-readable label displayed above the field. */
  label?: string;
  /** Adds a required validation rule and marks the field visually. */
  required?: boolean;
  /** Renders the field in read-only mode (no user input allowed). */
  readonly?: boolean;
  /** `v-if` predicate — removes the field from the DOM entirely when `false`. */
  visible?: (ctx: { model: T }) => boolean;
  /** `v-show` predicate — hides the field while keeping it in the DOM. */
  show?: (ctx: { model: T }) => boolean;
  /** Callback fired after the field value changes. */
  onChange?: (ctx: { model: T; val: unknown }) => void;
  /**
   * Synchronous client-side validation.
   * Return `null` if the value is valid, or an error message string otherwise.
   * The first argument is the current field value, typed as the union of all
   * model values (plus `null` / `undefined`) so TypeScript can contextually type
   * the callback parameter without falling back to implicit `any`.
   */
  validate?: (
    val: T[keyof T & string] | null | undefined,
    ctx: { model: T },
  ) => string | null;
  /**
   * Asynchronous validation (e.g. uniqueness check, server-side rule).
   * Runs debounced after every value change.
   * Return `null` if valid, or an error message string otherwise.
   */
  validateAsync?: (
    val: T[keyof T & string] | null | undefined,
    ctx: { model: T },
  ) => Promise<string | null>;
  /** Debounce delay in milliseconds for `validateAsync`. Default: `600`. */
  validateAsyncDebounce?: number;
  /** Custom get/set accessor. Overrides the registry-level accessor for this field. */
  accessor?: FieldAccessor;
  /** When `true`, reads/writes `model.translations[currentLang][key]` instead of `model[key]`. */
  translatable?: boolean;
  /** When `true`, propagates the value to all available language translations simultaneously. */
  synci18n?: boolean;
  /** Group name. Fields sharing the same group are rendered inside a collapsible group card. */
  group?: string;
  /** Tab name. Fields sharing the same tab are rendered under the same tab panel. */
  tab?: string;
  /**
   * Column span (out of 12) for the field wrapper.
   * Accepts a plain number or a responsive breakpoint map `{ sm, md, lg }`.
   * Default: `12` (full width).
   */
  cols?: number | { sm?: number; md?: number; lg?: number };
  /** CSS class applied to the outer field wrapper element. */
  class?: string | string[] | Record<string, boolean>;
  /**
   * When `true`, the field renders an expand button that fills the group container.
   * The group becomes a full-screen overlay and all other fields are hidden.
   * Useful for large textarea, rich-text editors, maps, etc.
   */
  expandable?: boolean;
  /** Debounce delay in milliseconds for the `update:modelValue` emit. Default: `300`. Use `0` for immediate. */
  debounce?: number;
  /** Extra attributes forwarded to the underlying field component via `v-bind`. */
  attrs?: Record<string, unknown>;
  /** Direct component override. Takes priority over `registry.mapping[type]`. */
  is?: Component;
}

// ─── Discriminated union for each KnownFieldType ─────────────────────────────

/** Descriptor for plain text input (`type: 'text'`) and multi-line textarea (`type: 'textarea'`). */
export interface TextDescriptor<
  T = Record<string, unknown>,
> extends FieldBase<T> {
  type: `${KnownFieldType.Text}` | `${KnownFieldType.Textarea}`;
  attrs?: FieldBase<T>["attrs"] & {
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
  };
}

/** Descriptor for numeric input (`type: 'number'`) and range slider (`type: 'slider'`). */
export interface NumberDescriptor<
  T = Record<string, unknown>,
> extends FieldBase<T> {
  type: `${KnownFieldType.Number}` | `${KnownFieldType.Slider}`;
  attrs?: FieldBase<T>["attrs"] & { min?: number; max?: number; step?: number };
}

/** Descriptor for checkbox (`type: 'boolean'`) and toggle switch (`type: 'switch'`). */
export interface BooleanDescriptor<
  T = Record<string, unknown>,
> extends FieldBase<T> {
  type: `${KnownFieldType.Boolean}` | `${KnownFieldType.Switch}`;
}

/** Descriptor for a single-value or multi-value select menu. Requires `attrs.options`. */
export interface SelectDescriptor<
  T = Record<string, unknown>,
> extends FieldBase<T> {
  type: `${KnownFieldType.Select}`;
  attrs: {
    options: Array<{ text: string; value: unknown }>;
    multiple?: boolean;
  } & Record<string, unknown>;
}

/**
 * Descriptor for FK autocomplete (`type: 'fks'`) and many-to-many autocomplete (`type: 'm2m'`).
 * Requires `attrs.endpoint`.
 */
export interface FksDescriptor<
  T = Record<string, unknown>,
> extends FieldBase<T> {
  type: `${KnownFieldType.Fks}` | `${KnownFieldType.M2m}`;
  attrs: {
    endpoint: string;
    itemText?: string;
    itemValue?: string;
    returnObject?: boolean;
    multiple?: boolean;
  } & Record<string, unknown>;
}

/** Descriptor for date (`type: 'date'`), time (`type: 'time'`), and datetime (`type: 'datetime'`) pickers. */
export interface DateDescriptor<
  T = Record<string, unknown>,
> extends FieldBase<T> {
  type:
    | `${KnownFieldType.Date}`
    | `${KnownFieldType.Time}`
    | `${KnownFieldType.Datetime}`;
  attrs?: FieldBase<T>["attrs"] & {
    min?: string;
    max?: string;
    granularity?: string;
  };
}

/** Descriptor for a colour picker field. */
export interface ColorDescriptor<
  T = Record<string, unknown>,
> extends FieldBase<T> {
  type: `${KnownFieldType.Color}`;
}

/** Descriptor for a file upload field. */
export interface FileDescriptor<
  T = Record<string, unknown>,
> extends FieldBase<T> {
  type: `${KnownFieldType.File}`;
  attrs?: FieldBase<T>["attrs"] & { accept?: string; maxSize?: number };
}

/** Descriptor for a Tiptap rich-text editor. */
export interface EditorDescriptor<
  T = Record<string, unknown>,
> extends FieldBase<T> {
  type: `${KnownFieldType.Editor}`;
  attrs?: FieldBase<T>["attrs"] & { extensions?: unknown[] };
}

/** Descriptor for the SEO preview field (title + description + live SERP preview). */
export interface SeoDescriptor<
  T = Record<string, unknown>,
> extends FieldBase<T> {
  type: `${KnownFieldType.Seo}`;
}

/** Descriptor for a Leaflet map field. Model value is `{ lat: number; lng: number }`. */
export interface MapDescriptor<
  T = Record<string, unknown>,
> extends FieldBase<T> {
  type: `${KnownFieldType.Map}`;
  attrs?: FieldBase<T>["attrs"] & {
    defaultLat?: number;
    defaultLng?: number;
    zoom?: number;
  };
}

/** Descriptor for a drag-and-drop repeater with nested field descriptors. */
export interface RepeaterDescriptor<
  T = Record<string, unknown>,
> extends FieldBase<T> {
  type: `${KnownFieldType.Repeater}`;
  /** Field descriptors for each item inside the repeater. */
  fields: FieldDescriptor[];
  attrs?: FieldBase<T>["attrs"] & {
    /** Multiple templates for heterogeneous items (`oneOf` discriminated union). */
    templates?: Record<string, FieldDescriptor[]>;
    /** Label shown when an item is collapsed. */
    previewLabel?: (item: unknown) => string;
    confirmDelete?: boolean;
    allowDuplicate?: boolean;
    /** Show a numeric position input alongside the reorder buttons. */
    showPositionField?: boolean;
    defaultExpanded?: boolean;
    maxItems?: number;
    minItems?: number;
    /**
     * Renders a compact preview card for inactive items.
     * Activated when the number of items exceeds `compressThreshold`.
     */
    miniCard?: (
      item: unknown,
      index: number,
    ) => {
      title: string;
      subtitle?: string;
      /** URL or base64 string for a thumbnail image. */
      thumbnail?: string;
      statusColor?: "success" | "warning" | "error" | "neutral";
    };
    /** Minimum item count above which contextual scaling activates. Default: `3`. */
    compressThreshold?: number;
  };
}

/** Descriptor for media/file manager fields. */
export interface MediaDescriptor<
  T = Record<string, unknown>,
> extends FieldBase<T> {
  type:
    | `${KnownFieldType.Media}`
    | `${KnownFieldType.MediaM2m}`
    | `${KnownFieldType.EnhancedMedia}`;
  attrs?: FieldBase<T>["attrs"] & { mime?: string; multiple?: boolean };
}

/** Escape-hatch descriptor for custom field types registered by the consumer. */
export interface CustomDescriptor<
  T = Record<string, unknown>,
> extends FieldBase<T> {
  type: string & {};
  attrs?: Record<string, unknown>;
}

/**
 * Union of all concrete field descriptor types.
 * Use this as the type for a `fields` array passed to `<MapoForm>` or `useMapoForm()`.
 *
 * @example
 * const fields: FieldDescriptor<Article>[] = [
 *   { key: 'title', type: KnownFieldType.Text, label: 'Title', required: true },
 *   { key: 'body',  type: KnownFieldType.Editor, label: 'Body', translatable: true },
 * ]
 */
export type FieldDescriptor<T = Record<string, unknown>> =
  | TextDescriptor<T>
  | NumberDescriptor<T>
  | BooleanDescriptor<T>
  | SelectDescriptor<T>
  | FksDescriptor<T>
  | DateDescriptor<T>
  | ColorDescriptor<T>
  | FileDescriptor<T>
  | EditorDescriptor<T>
  | SeoDescriptor<T>
  | MapDescriptor<T>
  | RepeaterDescriptor<T>
  | MediaDescriptor<T>
  | CustomDescriptor<T>;
