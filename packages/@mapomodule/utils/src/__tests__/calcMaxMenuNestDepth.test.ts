import { describe, it, expect } from "vitest";
import { calcMaxMenuNestDepth } from "../menuHelpers.js";
import type { MenuNode } from "../menuHelpers.js";

function node(label: string, children: MenuNode[] = []): MenuNode {
  return {
    link: `/${label}`,
    label,
    icon: "",
    children,
    meta: {},
    sidebarFooter: false,
  };
}

describe("calcMaxMenuNestDepth", () => {
  it("returns 0 for empty list", () => {
    expect(calcMaxMenuNestDepth([])).toBe(0);
  });

  it("returns 1 for flat list", () => {
    expect(calcMaxMenuNestDepth([node("a"), node("b")])).toBe(1);
  });

  it("returns 2 for one level of nesting", () => {
    const tree = [node("parent", [node("child")])];
    expect(calcMaxMenuNestDepth(tree)).toBe(2);
  });

  it("returns 3 for two levels of nesting", () => {
    const tree = [node("root", [node("mid", [node("leaf")])])];
    expect(calcMaxMenuNestDepth(tree)).toBe(3);
  });

  it("returns max across branches", () => {
    const tree = [
      node("a", [node("a1", [node("a2")])]),
      node("b", [node("b1")]),
    ];
    expect(calcMaxMenuNestDepth(tree)).toBe(3);
  });
});
