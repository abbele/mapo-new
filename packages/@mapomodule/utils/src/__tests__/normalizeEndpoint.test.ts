import { describe, it, expect } from "vitest";
import { normalizeEndpoint } from "../normalizeEndpoint";

describe("normalizeEndpoint", () => {
  it("adds leading and trailing slash to a bare path", () => {
    expect(normalizeEndpoint("api/articles")).toBe("/api/articles/");
  });

  it("keeps a correctly formed path unchanged", () => {
    expect(normalizeEndpoint("/api/articles/")).toBe("/api/articles/");
  });

  it("adds trailing slash when missing", () => {
    expect(normalizeEndpoint("/api/articles")).toBe("/api/articles/");
  });

  it("removes extra leading slashes", () => {
    expect(normalizeEndpoint("///api/articles/")).toBe("/api/articles/");
  });

  it("removes extra trailing slashes", () => {
    expect(normalizeEndpoint("/api/articles///")).toBe("/api/articles/");
  });

  it("handles a single segment", () => {
    expect(normalizeEndpoint("users")).toBe("/users/");
  });

  it("handles empty string", () => {
    expect(normalizeEndpoint("")).toBe("//");
  });
});
