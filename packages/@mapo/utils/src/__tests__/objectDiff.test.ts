import { describe, it, expect } from "vitest";
import { objectDiff } from "../objectDiff.js";

describe("objectDiff", () => {
  it("returns empty object when inputs are identical", () => {
    expect(objectDiff({ a: 1 }, { a: 1 })).toEqual({});
  });

  it("detects changed scalar values", () => {
    expect(objectDiff({ a: 1, b: 2 }, { a: 1, b: 99 })).toEqual({ b: 99 });
  });

  it("detects added keys", () => {
    expect(
      objectDiff(
        {} as Record<string, unknown>,
        { a: 1 } as Record<string, unknown>,
      ),
    ).toEqual({ a: 1 });
  });

  it("detects removed keys (value becomes undefined)", () => {
    expect(
      objectDiff(
        { a: 1 } as Record<string, unknown>,
        {} as Record<string, unknown>,
      ),
    ).toEqual({ a: undefined });
  });

  it("handles nested diffs recursively", () => {
    expect(objectDiff({ a: { x: 1, y: 2 } }, { a: { x: 1, y: 99 } })).toEqual({
      a: { y: 99 },
    });
  });

  it("returns empty for identical nested objects", () => {
    expect(objectDiff({ a: { x: 1 } }, { a: { x: 1 } })).toEqual({});
  });

  it("uses Object.is for NaN comparison", () => {
    expect(objectDiff({ a: NaN }, { a: NaN })).toEqual({});
  });
});
