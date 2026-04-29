import type { RouteRecordNormalized, RouteMeta } from "vue-router";

export interface MenuNode {
  link: string;
  label: string;
  icon: string;
  children: MenuNode[];
  meta: RouteMeta;
  sidebarFooter: boolean;
}

/** Return the maximum nesting depth of a MenuNode tree (root = depth 1). */
export function calcMaxMenuNestDepth(nodes: MenuNode[], depth = 1): number {
  if (!nodes.length) return depth - 1;
  let max = depth;
  for (const node of nodes) {
    if (node.children.length) {
      const child = calcMaxMenuNestDepth(node.children, depth + 1);
      if (child > max) max = child;
    }
  }
  return max;
}

export function buildRouteTree(routes: RouteRecordNormalized[]): MenuNode[] {
  const nodeMap = new Map<string, MenuNode>();

  for (const route of routes) {
    const { label, icon, hidden, sidebarFooter } = route.meta ?? {};
    if (!label || hidden) continue;
    nodeMap.set(route.path, {
      link: route.path,
      label,
      icon: icon ?? "i-lucide-circle-dot",
      children: [],
      meta: route.meta ?? {},
      sidebarFooter: Boolean(sidebarFooter),
    });
  }

  const roots: MenuNode[] = [];
  for (const route of routes) {
    const { label, parent } = route.meta ?? {};
    if (!label) continue;
    const node = nodeMap.get(route.path)!;
    if (parent && nodeMap.has(parent)) {
      nodeMap.get(parent)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
