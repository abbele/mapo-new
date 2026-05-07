function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

export function objectDiff<T extends Record<string, unknown>>(
  base: T,
  current: T,
): Partial<T> {
  const diff: Partial<T> = {};
  const allKeys = new Set([
    ...Object.keys(base),
    ...Object.keys(current),
  ]) as Set<keyof T>;

  for (const key of allKeys) {
    const baseVal = base[key];
    const currentVal = current[key];
    if (isPlainObject(baseVal) && isPlainObject(currentVal)) {
      const nested = objectDiff(
        baseVal as Record<string, unknown>,
        currentVal as Record<string, unknown>,
      );
      if (Object.keys(nested).length > 0) {
        diff[key] = nested as T[keyof T];
      }
    } else if (!Object.is(baseVal, currentVal)) {
      diff[key] = currentVal;
    }
  }
  return diff;
}
