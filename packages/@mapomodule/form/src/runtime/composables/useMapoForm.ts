import {
  ref,
  computed,
  toRaw,
  toValue,
  type Ref,
  type MaybeRef,
  provide,
  inject,
} from "vue";
import {
  getNestedValue,
  setNestedValueMutating,
  objectDiff,
} from "@mapomodule/utils";
import type { FieldDescriptor, FieldRegistry } from "../types/index.js";
import { resolveFieldAccessor } from "../types/index.js";
import { useCurrentLang } from "./useCurrentLang.js";

/** Options accepted by `useMapoForm()`. */
export interface UseMapoFormOptions<T extends Record<string, unknown>> {
  model: Ref<T>;
  fields: MaybeRef<FieldDescriptor<T>[]>;
  errors?: Ref<Record<string, string[]>>;
  languages?: string[];
  currentLang?: Ref<string>;
  immediate?: boolean;
  /** Global debounce in milliseconds. Override per field with `descriptor.debounce`. Default: `300`. */
  debounce?: number;
  registry: FieldRegistry;
}

/** Reactive context shared with child form fields via provide/inject. */
export interface MapoFormContext<T extends Record<string, unknown>> {
  model: Ref<T>;
  fields: MaybeRef<FieldDescriptor<T>[]>;
  errors: Ref<Record<string, string[]>>;
  languages: string[];
  currentLang: Ref<string>;
  readonly: Ref<boolean>;
  immediate: boolean;
  debounce: number;
  registry: FieldRegistry;
  setFieldValue: (key: string, val: unknown) => void;
  getClientError: (key: string) => string | null;
  markTouched: (key: string) => void;
  isTouched: (key: string) => boolean;
  submitted: Ref<boolean>;
}

function safeClone<X>(v: X): X {
  // Unwrap reactive proxies before cloning: structuredClone fails on Vue proxies,
  // but still preserves Date/File/Blob/Map instances that JSON would lose.
  const raw = toRaw(v) as X;
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(raw);
    } catch {
      /* fall back to JSON */
    }
  }
  return JSON.parse(JSON.stringify(raw));
}

/** Injection key for the current Mapo form context. */
export const FORM_KEY = Symbol("mapoForm");

/** Provides the current form context to descendant field components. */
export function provideMapoForm<T extends Record<string, unknown>>(
  ctx: MapoFormContext<T>,
) {
  provide(FORM_KEY, ctx);
}

/** Injects the nearest form context, if present. */
export function injectMapoForm<T extends Record<string, unknown>>() {
  return inject<MapoFormContext<T>>(FORM_KEY);
}

/**
 * Creates the core reactive state and helpers for a Mapo form.
 * Handles dirty tracking, field accessors, sync validation, and submit flows.
 */
export function useMapoForm<T extends Record<string, unknown>>(
  options: UseMapoFormOptions<T>,
) {
  const {
    model,
    fields,
    errors = ref({}),
    languages = [],
    currentLang: currentLangProp,
    immediate = false,
    debounce: debounceMs = 300,
    registry,
  } = options;

  const currentLang = useCurrentLang(currentLangProp);
  const backup = ref(safeClone(model.value)) as Ref<T>;
  const clientErrors = ref<Record<string, string>>({});
  const isLoading = ref(false);
  const readonly = ref(false);
  const touched = ref<Set<string>>(new Set());
  const submitted = ref(false);

  // Incremental dirty tracking: updated in setFieldValue to avoid
  // a JSON.stringify(objectDiff(...)) on every computed read.
  const dirtyKeys = ref<Set<string>>(new Set());
  const isDirty = computed(() => dirtyKeys.value.size > 0);

  function markTouched(key: string) {
    if (touched.value.has(key)) return;
    touched.value.add(key);
    touched.value = new Set(touched.value);
  }

  function isTouched(key: string): boolean {
    return submitted.value || touched.value.has(key);
  }

  const allErrors = computed(() => {
    const merged: Record<string, string[]> = { ...errors.value };
    for (const [k, v] of Object.entries(clientErrors.value)) {
      merged[k] = [v, ...(merged[k] ?? [])];
    }
    return merged;
  });

  function resolvePath(descriptor: FieldDescriptor<T>): string {
    const lang = currentLang.value;
    if (descriptor.translatable && lang) {
      return `translations.${lang}.${descriptor.key}`;
    }
    return descriptor.key as string;
  }

  function initLang(lang: string) {
    const m = model.value as Record<string, unknown>;
    if (!m.translations) m.translations = {};
    const translations = m.translations as Record<string, unknown>;
    if (!translations[lang]) translations[lang] = {};
  }

  function setFieldValue(descriptor: FieldDescriptor<T>, val: unknown) {
    const accessor = resolveFieldAccessor(
      descriptor as FieldDescriptor,
      registry,
    );
    const setVal = accessor.set
      ? accessor.set({ model: model.value, val, lang: currentLang.value })
      : val;

    if (descriptor.synci18n && languages.length) {
      for (const lang of languages) {
        initLang(lang);
        setNestedValueMutating(
          model.value as unknown as Record<string, unknown>,
          `translations.${lang}.${descriptor.key as string}`,
          setVal,
        );
      }
    } else {
      if (descriptor.translatable && currentLang.value)
        initLang(currentLang.value);
      setNestedValueMutating(
        model.value as unknown as Record<string, unknown>,
        resolvePath(descriptor),
        setVal,
      );
    }

    descriptor.onChange?.({ model: model.value, val: setVal });

    const key = descriptor.key as string;
    if (!dirtyKeys.value.has(key)) {
      dirtyKeys.value.add(key);
      dirtyKeys.value = new Set(dirtyKeys.value);
    }
    // Clear any stale client-side errors for this field: while the user is typing
    // it makes no sense to leave an old message until the next validation run.
    if (clientErrors.value[key]) {
      const next = { ...clientErrors.value };
      delete next[key];
      clientErrors.value = next;
    }
  }

  function getFieldValue(descriptor: FieldDescriptor<T>): unknown {
    const raw = getNestedValue(model.value, resolvePath(descriptor));
    const accessor = resolveFieldAccessor(
      descriptor as FieldDescriptor,
      registry,
    );
    return accessor.get
      ? accessor.get({ model: model.value, val: raw, lang: currentLang.value })
      : raw;
  }

  function getClientError(descriptor: FieldDescriptor<T>): string | null {
    if (!descriptor.validate) return null;
    // "No-anxiety" gate: the error appears only after blur or submit, never on mount.
    if (!isTouched(descriptor.key as string)) return null;
    const val = getFieldValue(descriptor);
    return descriptor.validate(val, { model: model.value });
  }

  function validateClient(): {
    valid: boolean;
    errors: Record<string, string>;
  } {
    // Explicit execution: always validate all fields, bypassing the
    // "touched/submitted" gate that only controls reactive message rendering.
    const errs: Record<string, string> = {};
    const fs = toValue(fields);
    for (const descriptor of fs) {
      if (!descriptor.validate) continue;
      const val = getFieldValue(descriptor);
      const err = descriptor.validate(val, { model: model.value });
      if (err) errs[descriptor.key as string] = err;
    }
    clientErrors.value = errs;
    return { valid: Object.keys(errs).length === 0, errors: errs };
  }

  function resetDirty() {
    backup.value = safeClone(model.value);
    dirtyKeys.value = new Set();
  }

  function getPatch(): Partial<T> {
    return objectDiff(backup.value, model.value) as Partial<T>;
  }

  async function submit(
    handler: (model: T | Partial<T>, isNew: boolean) => Promise<void>,
    isNew = false,
  ) {
    if (isLoading.value) return;
    submitted.value = true;
    const { valid } = validateClient();
    if (!valid) return;
    isLoading.value = true;
    try {
      await handler(isNew ? model.value : getPatch(), isNew);
      resetDirty();
      submitted.value = false;
      touched.value = new Set();
    } finally {
      isLoading.value = false;
    }
  }

  const ctx: MapoFormContext<T> = {
    model,
    fields,
    errors: allErrors,
    languages,
    currentLang,
    readonly,
    immediate,
    debounce: debounceMs,
    registry,
    setFieldValue: (key: string, val: unknown) => {
      const fs = toValue(fields);
      const descriptor = fs.find((f) => f.key === key);
      if (descriptor) setFieldValue(descriptor, val);
    },
    getClientError: (key: string) => {
      const fs = toValue(fields);
      const descriptor = fs.find((f) => f.key === key);
      return descriptor ? getClientError(descriptor) : null;
    },
    markTouched,
    isTouched,
    submitted,
  };

  // Public API: accepts either a string key or a full descriptor, making it ergonomic
  // for external consumers (tests, user code) as well as internal callers.
  function setFieldValuePublic(
    keyOrDescriptor: string | FieldDescriptor<T>,
    val: unknown,
  ) {
    if (typeof keyOrDescriptor === "string") {
      const fs = toValue(fields);
      const descriptor = fs.find((f) => (f.key as string) === keyOrDescriptor);
      if (descriptor) setFieldValue(descriptor, val);
      return;
    }
    setFieldValue(keyOrDescriptor, val);
  }

  function getClientErrorPublic(
    keyOrDescriptor: string | FieldDescriptor<T>,
  ): string | null {
    if (typeof keyOrDescriptor === "string") {
      const fs = toValue(fields);
      const descriptor = fs.find((f) => (f.key as string) === keyOrDescriptor);
      return descriptor ? getClientError(descriptor) : null;
    }
    return getClientError(keyOrDescriptor);
  }

  return {
    state: computed(() => ({
      model: model.value,
      errors: allErrors.value,
      isDirty: isDirty.value,
      currentLang: currentLang.value,
      isLoading: isLoading.value,
    })),
    isDirty,
    isLoading,
    readonly,
    currentLang,
    getFieldValue,
    setFieldValue: setFieldValuePublic,
    getClientError: getClientErrorPublic,
    markTouched,
    isTouched,
    validateClient,
    resetDirty,
    getPatch,
    submit,
    ctx,
    /** Exposes the context via provide() for child field components. */
    provideContext: () => provideMapoForm(ctx),
  };
}
