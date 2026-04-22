import type { RouteRecordNormalized } from "vue-router";

export interface MenuNode {
  link: string;
  label: string;
  icon: string;
  children: MenuNode[];
  meta: Record<string, unknown>;
  sidebarFooter: boolean;
}

export function buildRouteTree(routes: RouteRecordNormalized[]): MenuNode[] {
  const nodeMap = new Map<string, MenuNode>();

  for (const route of routes) {
    const meta = (route.meta ?? {}) as Record<string, unknown>;
    if (!meta.label) continue;
    const label = meta.label as string;
    nodeMap.set(route.path, {
      link: route.path,
      label,
      icon:
        (meta.icon as string) ??
        `mdi-alpha-${label[0].toLowerCase()}-box-outline`,
      children: [],
      meta,
      sidebarFooter: Boolean(meta.sidebarFooter),
    });
  }

  const roots: MenuNode[] = [];
  for (const route of routes) {
    const meta = (route.meta ?? {}) as Record<string, unknown>;
    if (!meta.label) continue;
    const node = nodeMap.get(route.path)!;
    const parentPath = meta.parent as string | undefined;
    if (parentPath && nodeMap.has(parentPath)) {
      nodeMap.get(parentPath)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
