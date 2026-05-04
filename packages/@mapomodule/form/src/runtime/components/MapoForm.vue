<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, useSlots, watchEffect } from "vue";
import type { Ref } from "vue";
import { useNuxtApp } from "#app";
import type { FieldDescriptor, FieldRegistry } from "../types/index.js";
import { useMapoForm } from "../composables/useMapoForm.js";
import { provideCurrentLang } from "../composables/useCurrentLang.js";
import MapoFormField from "./MapoFormField.vue";
import MapoFormGroup from "./MapoFormGroup.vue";
import MapoFormTabs from "./MapoFormTabs.vue";

const props = withDefaults(
  defineProps<{
    modelValue: T;
    fields: FieldDescriptor<T>[];
    errors?: Record<string, string[]>;
    languages?: string[];
    currentLang?: string;
    readonly?: boolean;
    immediate?: boolean;
    /**
     * Field component registry. When omitted, it is auto-injected from
     * `$mapoFormRegistry` (provided by the `@mapomodule/form` plugin).
     * Pass it explicitly only for headless forms or one-off registry swaps.
     */
    registry?: FieldRegistry;
  }>(),
  {
    errors: () => ({}),
    languages: () => [],
    currentLang: "",
    readonly: false,
    immediate: false,
  },
);

// Auto-inject the registry from the global plugin to remove the boilerplate
// `useNuxtApp().$mapoFormRegistry` + `:registry=…` from every page.
const injectedRegistry = computed<FieldRegistry>(() => {
  if (props.registry) return props.registry;
  const nuxt = useNuxtApp() as unknown as { $mapoFormRegistry?: FieldRegistry };
  if (!nuxt.$mapoFormRegistry) {
    throw new Error(
      "[MapoForm] No registry available: pass the `registry` prop or " +
        "make sure the @mapomodule/form module is installed.",
    );
  }
  return nuxt.$mapoFormRegistry;
});

const emit = defineEmits<{ "update:modelValue": [value: T] }>();

defineSlots<
  Record<string, (props: { field: FieldDescriptor<T> }) => unknown>
>();

// ─── Setup form ──────────────────────────────────────────────────────────────

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const currentLangRef = computed(() => props.currentLang);
const errorsRef = computed(() => props.errors);

// @ts-expect-error — typed by module augmentation at app build time
const globalDebounce: number =
  useRuntimeConfig().public.mapoForm?.debounce ?? 300;

const form = useMapoForm({
  model: model as unknown as Ref<T>,
  fields: computed(() => props.fields),
  errors: errorsRef,
  languages: props.languages,
  currentLang: currentLangRef,
  immediate: props.immediate,
  debounce: globalDebounce,
  registry: injectedRegistry.value,
});

watchEffect(() => {
  form.readonly.value = props.readonly;
});
form.provideContext();

defineExpose({
  submit: form.submit,
  validateClient: form.validateClient,
  resetDirty: form.resetDirty,
  getPatch: form.getPatch,
  isDirty: form.isDirty,
  isLoading: form.isLoading,
});

// Forward only field-specific slots to inner layers, avoiding host-level slots
// such as header/footer/actions where they have no meaning.
const slots = useSlots();
const fieldSlotNames = computed(() =>
  Object.keys(slots).filter((name) => name.startsWith("field.")),
);
provideCurrentLang(currentLangRef);

// ─── Group fields by tab/group ───────────────────────────────────────────────

interface GroupEntry {
  label?: string;
  fields: FieldDescriptor<T>[];
}
interface TabEntry {
  name: string;
  label?: string;
  groups: Map<string, GroupEntry>;
}

const grouped = computed<Map<string, TabEntry>>(() => {
  const tabs = new Map<string, TabEntry>();

  for (const field of props.fields) {
    const tabName = field.tab ?? "__default__";
    const groupName = field.group ?? "__flat__";

    if (!tabs.has(tabName)) {
      tabs.set(tabName, { name: tabName, groups: new Map() });
    }
    const tab = tabs.get(tabName)!;
    if (!tab.groups.has(groupName)) {
      tab.groups.set(groupName, { fields: [] });
    }
    tab.groups.get(groupName)!.fields.push(field);
  }

  return tabs;
});

// Static lookup: Tailwind v4 must see these classes as literal strings in source
// to include them in generated CSS. Dynamic template literals are not scanned.
const COL_SPAN: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};
const SM_COL_SPAN: Record<number, string> = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
  5: "sm:col-span-5",
  6: "sm:col-span-6",
  7: "sm:col-span-7",
  8: "sm:col-span-8",
  9: "sm:col-span-9",
  10: "sm:col-span-10",
  11: "sm:col-span-11",
  12: "sm:col-span-12",
};
const MD_COL_SPAN: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
};
const LG_COL_SPAN: Record<number, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
};

function colsClass(cols: FieldDescriptor<T>["cols"]): string {
  if (!cols) return "col-span-12";
  if (typeof cols === "number") return COL_SPAN[cols] ?? "col-span-12";
  const parts: string[] = ["col-span-12"];
  if (cols.sm) parts.push(SM_COL_SPAN[cols.sm] ?? "");
  if (cols.md) parts.push(MD_COL_SPAN[cols.md] ?? "");
  if (cols.lg) parts.push(LG_COL_SPAN[cols.lg] ?? "");
  return parts.filter(Boolean).join(" ");
}

const hasTabs = computed(() => {
  const keys = [...grouped.value.keys()];
  return keys.length > 1 || (keys.length === 1 && keys[0] !== "__default__");
});

const defaultGroups = computed(
  () =>
    grouped.value.get("__default__")?.groups ?? new Map<string, GroupEntry>(),
);

const tabList = computed<TabEntry[]>(() => [...grouped.value.values()]);
</script>

<template>
  <div class="mapo-form space-y-5">
    <!-- All field slots (field.<key>, field.<key>.append, .prepend, .label, …)
         are forwarded generically to inner layers (Tabs → Group → Field). -->
    <MapoFormTabs v-if="hasTabs" :tabs="tabList">
      <template
        v-for="slotName in fieldSlotNames"
        :key="slotName"
        #[slotName]="slotProps"
      >
        <slot :name="slotName" v-bind="slotProps ?? {}" />
      </template>
    </MapoFormTabs>

    <template v-else>
      <template v-for="[groupName, group] of defaultGroups" :key="groupName">
        <MapoFormGroup
          v-if="groupName !== '__flat__'"
          :name="groupName"
          :fields="group.fields"
        >
          <template
            v-for="slotName in fieldSlotNames"
            :key="slotName"
            #[slotName]="slotProps"
          >
            <slot :name="slotName" v-bind="slotProps ?? {}" />
          </template>
        </MapoFormGroup>

        <div v-else class="grid grid-cols-12 gap-5">
          <div
            v-for="field in group.fields"
            :key="field.key as string"
            :class="colsClass(field.cols)"
          >
            <slot :name="`field.${field.key as string}`" :field="field">
              <MapoFormField :descriptor="field">
                <template
                  v-for="slotName in fieldSlotNames"
                  :key="slotName"
                  #[slotName]="slotProps"
                >
                  <slot :name="slotName" v-bind="slotProps ?? {}" />
                </template>
              </MapoFormField>
            </slot>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
