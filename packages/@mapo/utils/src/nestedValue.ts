export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce((current, key) => {
    if (current == null || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj);
}

export function setNestedValue<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown,
): T {
  const keys = path.split(".");
  const result = { ...obj } as Record<string, unknown>;
  let current = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...(current[key] as Record<string, unknown>) };
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
  return result as T;
}
