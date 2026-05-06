<script setup lang="ts" generic="T extends object">
import { computed, useSlots, watchEffect } from "vue";
import type { Ref } from "vue";
import { useNuxtApp } from "#app";
import type { FieldDescriptor, FieldRegistry } from "../types/index.js";
import { useMapoForm, injectMapoForm } from "../composables/useMapoForm.js";
import { provideCurrentLang } from "../composables/useCurrentLang.js";
import MapoFormGroup from "./MapoFormGroup.vue";
import MapoFormTabs from "./MapoFormTabs.vue";
import MapoFormFlatSection from "./MapoFormFlatSection.vue";

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
    registry: undefined,
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

const globalDebounce: number =
  // @ts-expect-error — typed by module augmentation at app build time
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

// If a parent useMapoForm called provideContext(), inherit its submitted state
// so that form.submit() on the parent automatically shows errors in this MapoForm.
const parentCtx = injectMapoForm();
watchEffect(() => {
  form.readonly.value = props.readonly;
  if (parentCtx) form.ctx.submitted.value = parentCtx.submitted.value;
});

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

        <MapoFormFlatSection v-else :fields="group.fields as FieldDescriptor[]">
          <template
            v-for="slotName in fieldSlotNames"
            :key="slotName"
            #[slotName]="slotProps"
          >
            <slot :name="slotName" v-bind="slotProps ?? {}" />
          </template>
        </MapoFormFlatSection>
      </template>
    </template>
  </div>
</template>
