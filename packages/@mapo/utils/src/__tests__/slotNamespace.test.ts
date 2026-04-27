import { describe, it, expect } from "vitest";
import { slotNamespace } from "../slotNamespace.js";
import type { Slots } from "vue";

const mockFn = () => [];

describe("slotNamespace", () => {
  it("returns only slots matching the prefix", () => {
    const slots: Slots = {
      "group.title": mockFn,
      "group.body": mockFn,
      "other.title": mockFn,
    };
    const result = slotNamespace(slots, "group.");
    expect(Object.keys(result)).toEqual(["title", "body"]);
  });

  it("strips the prefix from slot names", () => {
    const slots: Slots = { "ns.foo": mockFn };
    const result = slotNamespace(slots, "ns.");
    expect(result["foo"]).toBe(mockFn);
  });

  it("returns empty object when no slots match", () => {
    const slots: Slots = { "a.x": mockFn };
    expect(slotNamespace(slots, "b.")).toEqual({});
  });

  it("returns empty object for empty slots", () => {
    expect(slotNamespace({}, "ns.")).toEqual({});
  });
});
