<script setup lang="ts">
import { computed } from "vue";
import { parseDateTime, CalendarDateTime } from "@internationalized/date";
import type { DateDescriptor } from "../../types/index.js";

/** Time-only field backed by `UInputDate` with minute granularity. */
const props = defineProps<{
  modelValue: unknown;
  descriptor: DateDescriptor;
  errors?: string[];
  readonly?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{ "update:modelValue": [value: string | null] }>();

// UInputDate with `granularity='minute'` shows only hours and minutes.
// The value is normalised to `1970-01-01THH:MM:00` for parsing.
const calendarValue = computed<CalendarDateTime | undefined>(() => {
  const v = props.modelValue as string | null | undefined;
  if (!v) return undefined;
  const normalized = v.includes("T") ? v : `1970-01-01T${v}`;
  try {
    return parseDateTime(normalized);
  } catch {
    return undefined;
  }
});

function onUpdate(val: CalendarDateTime | null) {
  // Emit only `HH:MM`.
  if (!val) {
    emit("update:modelValue", null);
    return;
  }
  const h = String(val.hour).padStart(2, "0");
  const m = String(val.minute).padStart(2, "0");
  emit("update:modelValue", `${h}:${m}`);
}
</script>

<template>
  <UInputDate
    :model-value="calendarValue"
    granularity="minute"
    hide-time-zone
    :readonly="readonly"
    :disabled="disabled"
    :highlight="!!errors?.length"
    @update:model-value="onUpdate"
  />
</template>
