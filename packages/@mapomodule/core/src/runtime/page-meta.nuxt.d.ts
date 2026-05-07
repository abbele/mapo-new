declare module "#app" {
  interface PageMeta {
    /**
     * Permissions required to access this route. Checked by the 'permissions' middleware and sidebar visibility.
     * - `{ model: string }` — derives `view_<model>` from a Django model name and populates `authStore.pagePermissions`
     * - `string[]` — raw Django permission codenames (e.g. `['view_article', 'change_article']`)
     */
    permissions?: { model: string } | string[];
    /** Required role/group names. Checked by the 'roles' middleware. */
    roles?: string[];
  }
}

declare module "vue-router" {
  interface RouteMeta {
    permissions?: { model: string } | string[];
    roles?: string[];
    /** Route middleware names applied to this route. Read by useCanAccessRoute for sidebar visibility. */
    middleware?: string | string[];
  }
}

export {};
