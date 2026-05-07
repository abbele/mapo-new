declare module "#app" {
  interface PageMeta {
    /** Human-readable label shown in sidebar/navigation. Pages without a label are excluded from the menu. */
    label?: string;
    /** Icon name used in sidebar/navigation (e.g. 'i-lucide-user-check'). */
    icon?: string;
    /** Hide this page from automatic sidebar/navigation generation even if it has a label. */
    hidden?: boolean;
    /** Path of the parent route for nested menu grouping. */
    parent?: string;
    /** Pin this page to the sidebar footer instead of the main navigation list. */
    sidebarFooter?: boolean;
  }
}

declare module "vue-router" {
  interface RouteMeta {
    label?: string;
    icon?: string;
    hidden?: boolean;
    parent?: string;
    sidebarFooter?: boolean;
  }
}

export {};
