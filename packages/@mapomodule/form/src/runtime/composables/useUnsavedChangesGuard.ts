import { onBeforeUnmount, type Ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";

/** Optional configuration for the unsaved-changes navigation guard. */
export interface UnsavedChangesGuardOptions {
  message?: string;
  enabled?: Ref<boolean> | (() => boolean);
}

/**
 * Registers browser and router guards that warn before leaving a dirty form.
 */
export function useUnsavedChangesGuard(
  isDirty: Ref<boolean>,
  options: UnsavedChangesGuardOptions = {},
) {
  const message =
    options.message ?? "You have unsaved changes. Do you really want to leave?";
  const canUseWindow = typeof window !== "undefined";

  const isEnabled = (): boolean => {
    if (typeof options.enabled === "function") return options.enabled();
    if (options.enabled) return options.enabled.value;
    return true;
  };

  onBeforeRouteLeave(() => {
    if (!isEnabled() || !isDirty.value) return true;
    if (!canUseWindow) return true;
    return window.confirm(message);
  });

  const beforeUnload = (e: BeforeUnloadEvent) => {
    if (!isEnabled() || !isDirty.value) return;
    e.preventDefault();
    e.returnValue = "";
  };

  if (canUseWindow) {
    window.addEventListener("beforeunload", beforeUnload);
    onBeforeUnmount(() =>
      window.removeEventListener("beforeunload", beforeUnload),
    );
  }
}
