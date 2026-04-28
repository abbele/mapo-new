import { describe, it, expect } from "vitest";
import { getNestedValue, setNestedValue } from "../nestedValue.js";

describe("getNestedValue", () => {
  it("gets a top-level key", () => {
    expect(getNestedValue({ a: 1 }, "a")).toBe(1);
  });

  it("gets a deeply nested value", () => {
    expect(getNestedValue({ a: { b: { c: 42 } } }, "a.b.c")).toBe(42);
  });

  it("returns undefined for missing path", () => {
    expect(getNestedValue({ a: 1 }, "a.b.c")).toBeUndefined();
  });

  it("returns undefined when intermediate key is null", () => {
    expect(getNestedValue({ a: null }, "a.b")).toBeUndefined();
  });

  it("works on empty object", () => {
    expect(getNestedValue({}, "a")).toBeUndefined();
  });
});

describe("setNestedValue", () => {
  it("sets a top-level key", () => {
    expect(setNestedValue({ a: 1 }, "a", 2)).toEqual({ a: 2 });
  });

  it("sets a deeply nested value", () => {
    expect(setNestedValue({ a: { b: { c: 1 } } }, "a.b.c", 99)).toEqual({
      a: { b: { c: 99 } },
    });
  });

  it("creates intermediate objects if missing", () => {
    expect(setNestedValue({} as Record<string, unknown>, "a.b", 5)).toEqual({
      a: { b: 5 },
    });
  });

  it("does not mutate the original object", () => {
    const obj = { a: { b: 1 } };
    setNestedValue(obj, "a.b", 99);
    expect(obj.a.b).toBe(1);
  });
});
