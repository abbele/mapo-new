<script setup lang="ts">
import { ref, computed } from "vue";
import type { FieldDescriptor } from "../types/index.js";
import { injectMapoForm } from "../composables/useMapoForm.js";
import MapoFormGroup from "./MapoFormGroup.vue";
import MapoFormField from "./MapoFormField.vue";

interface TabEntry {
  name: string;
  label?: string;
  groups: Map<string, { label?: string; fields: FieldDescriptor[] }>;
}

const props = defineProps<{ tabs: TabEntry[] }>();

defineSlots<Record<string, unknown>>();

const activeTab = ref(props.tabs[0]?.name ?? "");

// Highlight tabs containing errors.
const form = injectMapoForm()!;
const tabsWithErrors = computed(() => {
  const errorKeys = new Set(Object.keys(form.errors.value));
  return new Set(
    props.tabs
      .filter((tab) =>
        [...tab.groups.values()].some((g) =>
          g.fields.some((f) => errorKeys.has(f.key as string)),
        ),
      )
      .map((t) => t.name),
  );
});

// col-span-* classes are safelisted in main.css via @source inline().
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
function colClass(cols: FieldDescriptor["cols"]): string {
  if (!cols || typeof cols !== "number") return "col-span-12";
  return COL_SPAN[cols] ?? "col-span-12";
}
</script>

<template>
  <div class="mapo-form-tabs">
    <!-- Tab bar -->
    <div class="flex gap-1 border-b border-gray-200 pb-px">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        type="button"
        class="relative flex items-center gap-1.5 rounded-t px-4 py-2 text-sm font-medium transition-colors"
        :class="[
          activeTab === tab.name
            ? 'border-b-2 border-primary-500 text-primary-600'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
        ]"
        @click="activeTab = tab.name"
      >
        {{ tab.label ?? tab.name }}
        <span
          v-if="tabsWithErrors.has(tab.name)"
          class="inline-block h-1.5 w-1.5 rounded-full bg-red-500"
          aria-label="This tab contains errors"
        />
      </button>
    </div>

    <!-- Tab content -->
    <div
      v-for="tab in tabs"
      v-show="activeTab === tab.name"
      :key="tab.name"
      class="space-y-5 pt-5"
    >
      <template v-for="[groupName, group] of tab.groups" :key="groupName">
        <MapoFormGroup
          v-if="groupName !== '__flat__'"
          :name="groupName"
          :label="group.label"
          :fields="group.fields"
        >
          <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps ?? {}" />
          </template>
        </MapoFormGroup>

        <div v-else class="grid grid-cols-12 gap-5">
          <div
            v-for="field in group.fields"
            :key="field.key as string"
            :class="colClass(field.cols)"
          >
            <slot :name="`field.${field.key as string}`" :field="field">
              <MapoFormField :descriptor="field">
                <template
                  v-for="(_, slotName) in $slots"
                  #[slotName]="slotProps"
                >
                  <slot :name="slotName" v-bind="slotProps ?? {}" />
                </template>
              </MapoFormField>
            </slot>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
