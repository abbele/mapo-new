import { describe, it, expect } from "vitest";
import { buildRouteTree } from "../menuHelpers.js";
import type { RouteRecordNormalized } from "vue-router";

function makeRoute(
  path: string,
  meta: Record<string, unknown>,
): RouteRecordNormalized {
  return {
    path,
    meta,
    name: undefined,
    components: {},
    children: [],
    props: {},
    redirect: undefined,
    aliasOf: undefined,
    beforeEnter: undefined,
    leaveGuards: new Set(),
    updateGuards: new Set(),
    instances: {},
    enterCallbacks: {},
  } as unknown as RouteRecordNormalized;
}

describe("buildRouteTree", () => {
  it("builds a flat list of top-level nodes", () => {
    const routes = [
      makeRoute("/dashboard", { label: "Dashboard" }),
      makeRoute("/users", { label: "Users" }),
    ];
    const tree = buildRouteTree(routes);
    expect(tree).toHaveLength(2);
    expect(tree[0].link).toBe("/dashboard");
    expect(tree[1].link).toBe("/users");
  });

  it("nests children under their parent", () => {
    const routes = [
      makeRoute("/users", { label: "Users" }),
      makeRoute("/users/new", { label: "New User", parent: "/users" }),
    ];
    const tree = buildRouteTree(routes);
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].label).toBe("New User");
  });

  it("skips routes without a label", () => {
    const routes = [
      makeRoute("/hidden", {}),
      makeRoute("/visible", { label: "Visible" }),
    ];
    expect(buildRouteTree(routes)).toHaveLength(1);
  });

  it("sets default icon from label initial", () => {
    const routes = [makeRoute("/about", { label: "About" })];
    expect(buildRouteTree(routes)[0].icon).toBe("mdi-alpha-a-box-outline");
  });

  it("uses explicit icon when provided", () => {
    const routes = [makeRoute("/home", { label: "Home", icon: "mdi-home" })];
    expect(buildRouteTree(routes)[0].icon).toBe("mdi-home");
  });

  it("marks sidebarFooter nodes", () => {
    const routes = [
      makeRoute("/settings", { label: "Settings", sidebarFooter: true }),
    ];
    expect(buildRouteTree(routes)[0].sidebarFooter).toBe(true);
  });

  it("returns empty array for empty input", () => {
    expect(buildRouteTree([])).toEqual([]);
  });
});
