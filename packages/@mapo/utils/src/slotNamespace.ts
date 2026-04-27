import type { Slots } from "vue";

export function slotNamespace(slots: Slots, prefix: string): Slots {
  return Object.fromEntries(
    Object.entries(slots)
      .filter(([name]) => name.startsWith(prefix))
      .map(([name, fn]) => [name.slice(prefix.length), fn]),
  ) as Slots;
}
