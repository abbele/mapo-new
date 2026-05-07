import { describe, it, expect } from "vitest";
import { deepMerge } from "../deepMerge.js";

describe("deepMerge", () => {
  it("merges flat objects", () => {
    expect(deepMerge({ a: 1, b: 2 }, { b: 3 })).toEqual({ a: 1, b: 3 });
  });

  it("merges nested objects recursively", () => {
    expect(deepMerge({ a: { x: 1, y: 2 } }, { a: { y: 99 } })).toEqual({
      a: { x: 1, y: 99 },
    });
  });

  it("does not mutate the base object", () => {
    const base = { a: 1 };
    deepMerge(base, { a: 2 });
    expect(base.a).toBe(1);
  });

  it("override wins over base for scalar values", () => {
    expect(deepMerge({ a: "old" }, { a: "new" })).toEqual({ a: "new" });
  });

  it("ignores undefined override values", () => {
    expect(deepMerge({ a: 1 }, { a: undefined })).toEqual({ a: 1 });
  });

  it("works with empty override", () => {
    expect(deepMerge({ a: 1 }, {})).toEqual({ a: 1 });
  });

  it("adds keys present only in override", () => {
    expect(
      deepMerge(
        { a: 1 } as Record<string, unknown>,
        { b: 2 } as Record<string, unknown>,
      ),
    ).toEqual({ a: 1, b: 2 });
  });
});
