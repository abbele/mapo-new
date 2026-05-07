import { useAuthStore } from "../stores/auth";

export function usePermissions() {
  const auth = useAuthStore();

  return {
    canView: (model: string) =>
      !!auth.info?.is_superuser || !!auth.modelPermissions[model]?.view,

    canAdd: (model: string) =>
      !!auth.info?.is_superuser || !!auth.modelPermissions[model]?.add,

    canChange: (model: string) =>
      !!auth.info?.is_superuser || !!auth.modelPermissions[model]?.change,

    canDelete: (model: string) =>
      !!auth.info?.is_superuser || !!auth.modelPermissions[model]?.delete,

    checkPermission: (codename: string) =>
      !!auth.info?.is_superuser || auth.rawPermissions.includes(codename),

    hasRole: (role: string) => auth.info?.groups?.includes(role) ?? false,
  };
}
