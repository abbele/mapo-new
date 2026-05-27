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

  it("preserves query string without adding trailing slash after ?", () => {
    expect(normalizeEndpoint("/api/articles/?fields=id,title")).toBe(
      "/api/articles/?fields=id,title",
    );
  });

  it("adds trailing slash before query string when path has no trailing slash", () => {
    expect(normalizeEndpoint("/api/articles?fields=id,title")).toBe(
      "/api/articles/?fields=id,title",
    );
  });

  it("adds leading slash when path with query string has no leading slash", () => {
    expect(normalizeEndpoint("api/articles/?q=1")).toBe("/api/articles/?q=1");
  });
});
