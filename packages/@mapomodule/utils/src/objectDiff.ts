function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function arraysDeepEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, i) => {
    const bItem = b[i];
    if (Array.isArray(item) && Array.isArray(bItem))
      return arraysDeepEqual(item, bItem);
    if (isPlainObject(item) && isPlainObject(bItem))
      return Object.keys(objectDiff(item, bItem)).length === 0;
    return Object.is(item, bItem);
  });
}

export function objectDiff<T extends object>(base: T, current: T): Partial<T> {
  const diff: Partial<T> = {};
  const allKeys = new Set([
    ...Object.keys(base),
    ...Object.keys(current),
  ]) as Set<keyof T>;

  for (const key of allKeys) {
    const baseVal = (base as Record<string, unknown>)[key as string];
    const currentVal = (current as Record<string, unknown>)[key as string];
    if (isPlainObject(baseVal) && isPlainObject(currentVal)) {
      const nested = objectDiff(
        baseVal as Record<string, unknown>,
        currentVal as Record<string, unknown>,
      );
      if (Object.keys(nested).length > 0) {
        diff[key] = nested as T[keyof T];
      }
    } else if (Array.isArray(baseVal) && Array.isArray(currentVal)) {
      if (!arraysDeepEqual(baseVal, currentVal)) {
        diff[key] = currentVal as T[keyof T];
      }
    } else if (!Object.is(baseVal, currentVal)) {
      diff[key] = currentVal as T[keyof T];
    }
  }
  return diff;
}
