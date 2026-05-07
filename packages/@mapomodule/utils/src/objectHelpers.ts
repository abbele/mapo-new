/**
 * Deep-clone a plain value (objects, arrays, primitives).
 * Does not handle class instances, Maps, Sets, or circular refs.
 */
export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(deepClone) as unknown as T;
  const result = {} as Record<string, unknown>;
  for (const key of Object.keys(value as object)) {
    result[key] = deepClone((value as Record<string, unknown>)[key]);
  }
  return result as T;
}

export function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

export function isBlob(value: unknown): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

export function isFileOrBlob(value: unknown): value is File | Blob {
  return isFile(value) || isBlob(value);
}

/**
 * Return all dot-notation paths in `obj` where the predicate is truthy.
 */
export function findPropPaths(
  obj: unknown,
  predicate: (val: unknown) => boolean,
  _prefix = "",
): string[] {
  if (obj === null || typeof obj !== "object") return [];
  const paths: string[] = [];
  for (const key of Object.keys(obj as object)) {
    const path = _prefix ? `${_prefix}.${key}` : key;
    const val = (obj as Record<string, unknown>)[key];
    if (predicate(val)) {
      paths.push(path);
    } else if (val !== null && typeof val === "object") {
      paths.push(...findPropPaths(val, predicate, path));
    }
  }
  return paths;
}

/** Return all paths in `obj` that hold a File or Blob. */
export function filesInObject(obj: unknown): string[] {
  return findPropPaths(obj, isFileOrBlob);
}

/**
 * Return a shallow copy of `obj` containing only the listed top-level keys.
 */
export function filterObj<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[],
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
