<script setup lang="ts" generic="T extends Record<string, unknown>">
import {
  ref,
  computed,
  toRaw,
  useSlots,
  onMounted,
  onBeforeUnmount,
  type VNode,
} from "vue";
import { objectDiff } from "@mapomodule/utils";
// @ts-expect-error — #imports is a Nuxt virtual module resolved at app build time
import {
  useRouter,
  onBeforeRouteLeave,
  useCrud,
  useSnackStore,
  useConfirmStore,
  useNuxtApp,
} from "#imports";
import type { FieldDescriptor, FieldRegistry } from "@mapomodule/form";

// ─── Props ────────────────────────────────────────────────────────────────────

const props = withDefaults(
  defineProps<{
    /** REST endpoint passed to useCrud. */
    endpoint: string;
    /** Record id. Pass `'new'` to create. */
    id: string | number;
    /** Fields for the main body form. */
    fields: FieldDescriptor<T>[];
    /** Fields for the sidebar form (optional). */
    sidebarFields?: FieldDescriptor<T>[];
    /** Translation language codes (e.g. ['it', 'en']). */
    languages?: string[];
    /** Human readable model name shown in the page title. */
    modelName?: string | null;
    /** Sidebar column span (1–11 in a 12-col grid). */
    sidebarCols?: number;
    /** Keep sidebar sticky while scrolling. */
    sticky?: boolean;
    /** Send PATCH (diff only) on update instead of PUT. */
    usePatch?: boolean;
    /** Force read-only mode. */
    readonly?: boolean;
    /** Field registry. Falls back to $mapoFormRegistry if omitted. */
    registry?: FieldRegistry | null;
  }>(),
  {
    sidebarFields: () => [],
    languages: () => [],
    sidebarCols: 4,
    sticky: true,
    usePatch: true,
    readonly: false,
    modelName: null,
    registry: null,
  },
);

const emit = defineEmits<{
  (e: "saved", model: T): void;
  (e: "deleted"): void;
}>();

// ─── Utilities ──────────────────────────────────────────────────────────────

const deepClone = (obj: unknown): unknown => {
  // toRaw is required: structuredClone cannot clone Vue reactive proxies
  const raw = toRaw(obj as object);
  if (typeof globalThis !== "undefined" && "structuredClone" in globalThis) {
    try {
      return structuredClone(raw);
    } catch {
      /* fall through to JSON */
    }
  }
  return JSON.parse(JSON.stringify(raw));
};

// ─── State ───────────────────────────────────────────────────────────────────

const { $mapoFormRegistry } = useNuxtApp() as unknown as {
  $mapoFormRegistry: FieldRegistry;
};
const registry = computed(() => props.registry ?? $mapoFormRegistry);

const router = useRouter();
const snack = useSnackStore();
const confirm = useConfirmStore();
const crud = useCrud<T>(props.endpoint);

const isNew = computed(() => String(props.id) === "new");
const model = ref<T>({} as T);
const backup = ref<T | null>(null);
const errors = ref<Record<string, string[]>>({});
// Start in loading state for existing items so MapoForm is never mounted with
// empty data and then immediately unmounted when the spinner appears on mount.
const isLoading = ref(String(props.id) !== "new");
const isSaving = ref(false);
const isDeleting = ref(false);
const currentLang = ref(props.languages[0] ?? "");

const isDirty = computed(
  () =>
    backup.value !== null &&
    Object.keys(objectDiff(backup.value, model.value)).length > 0,
);
const mainCols = computed(() => 12 - props.sidebarCols);
const sidebarStyle = computed(() =>
  props.sticky
    ? {
        position: "sticky" as const,
        top: "var(--mapo-topbar-height, 64px)",
      }
    : {},
);

// Tailwind v4 requires static class strings — dynamic template literals are not scanned by the CSS scanner.
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
const mainColsClass = computed(
  () => `col-span-12 ${MD_COL_SPAN[mainCols.value] ?? "md:col-span-8"}`,
);
const sidebarColsClass = computed(
  () => `col-span-12 ${MD_COL_SPAN[props.sidebarCols] ?? "md:col-span-4"}`,
);

// ─── Fetch ───────────────────────────────────────────────────────────────────

async function fetchModel() {
  if (isNew.value) {
    backup.value = null;
    return;
  }
  isLoading.value = true;
  try {
    model.value = await crud.detail(props.id);
    backup.value = deepClone(model.value) as T;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response
      ?.status;
    const detail = (err as { response?: { data?: { detail?: string } } })
      ?.response?.data?.detail;
    snack.show(detail ?? "Failed to load item", "error");
    if (status === 404) router.back();
  } finally {
    isLoading.value = false;
  }
}

// ─── Save ────────────────────────────────────────────────────────────────────

async function save(andBack = false) {
  errors.value = {};
  isSaving.value = true;
  try {
    let result: T;
    if (isNew.value) {
      result = await crud.create(model.value);
    } else if (props.usePatch) {
      const patch = getPatch();
      result = await crud.partialUpdate(
        model.value.id as string | number,
        patch,
      );
    } else {
      result = await crud.update(
        model.value.id as string | number,
        model.value,
      );
    }
    Object.assign(model.value, result);
    backup.value = deepClone(model.value) as T;
    snack.show(
      isNew.value ? "Created successfully" : "Saved successfully",
      "success",
    );
    emit("saved", model.value);
    if (isNew.value && result && "id" in result) {
      const id = (result as unknown as { id: string | number }).id;
      await router.replace({
        params: { id },
      });
    }
    if (andBack) back();
  } catch (err: unknown) {
    const response = (err as { response?: { status?: number; data?: unknown } })
      ?.response;
    if (
      response?.status === 400 &&
      response?.data &&
      typeof response.data === "object"
    ) {
      errors.value = response.data as Record<string, string[]>;
    }
    const detail = (response?.data as { detail?: string })?.detail;
    snack.show(detail ?? "Failed to save", "error");
  } finally {
    isSaving.value = false;
  }
}

function getPatch(): Partial<T> {
  if (!backup.value) return { ...model.value };
  return objectDiff(backup.value, model.value) as Partial<T>;
}

// ─── Delete ──────────────────────────────────────────────────────────────────

async function deleteItem() {
  const ok = await confirm.open({
    title: "Delete",
    question:
      "Are you sure you want to delete this item? This action cannot be undone.",
    approveButton: { text: "Delete", attrs: { color: "red" } },
  });
  if (!ok) return;
  isDeleting.value = true;
  try {
    await crud.delete(model.value.id as string | number);
    backup.value = deepClone(model.value) as T; // clear dirty so guard doesn't fire
    snack.show("Deleted successfully", "success");
    emit("deleted");
    back();
  } catch (err: unknown) {
    const detail = (err as { response?: { data?: { detail?: string } } })
      ?.response?.data?.detail;
    snack.show(detail ?? "Failed to delete", "error");
  } finally {
    isDeleting.value = false;
  }
}

// ─── Navigation guard ────────────────────────────────────────────────────────

function back() {
  router.back();
}

async function guardUnsaved(): Promise<boolean> {
  if (!isDirty.value) return true;
  return confirm.open({
    title: "Unsaved changes",
    question: "You have unsaved changes. Do you want to leave without saving?",
    approveButton: { text: "Leave", attrs: { color: "red" } },
  });
}

onBeforeRouteLeave(
  (_to: unknown, _from: unknown, next: (ok: boolean) => void) => {
    guardUnsaved().then((ok) => next(ok));
  },
);

// @ts-expect-error — Event is a global type not defined in node environments
function preventWindowClose(e: Event) {
  if (isDirty.value && typeof globalThis !== "undefined") {
    e.preventDefault();
    if ("returnValue" in e) {
      // @ts-expect-error — returnValue is specific to BeforeUnloadEvent
      (e as any).returnValue = "";
    }
  }
}

onMounted(() => {
  if (typeof globalThis !== "undefined" && "addEventListener" in globalThis) {
    // @ts-expect-error — addEventListener exists at runtime
    (globalThis as any).addEventListener("beforeunload", preventWindowClose);
  }
  fetchModel();
});

onBeforeUnmount(() => {
  if (
    typeof globalThis !== "undefined" &&
    "removeEventListener" in globalThis
  ) {
    // @ts-expect-error — removeEventListener exists at runtime
    (globalThis as any).removeEventListener("beforeunload", preventWindowClose);
  }
});

// ─── Slot bindings ───────────────────────────────────────────────────────────

// Only forward field-level slots (prefixed with `field.`) to MapoForm.
// Host-level slots (title, body, side-buttons, etc.) must not be injected into
// MapoForm to prevent duplicate or recursive rendering.
const slots = useSlots();
const formSlotNames = computed(() =>
  Object.keys(slots).filter((name) => name.startsWith("field.")),
);

const slotBindings = computed(() => ({
  model: model.value,
  errors: errors.value,
  currentLang: currentLang.value,
  isNew: isNew.value,
  isLoading: isLoading.value,
  isSaving: isSaving.value,
  isDeleting: isDeleting.value,
  isDirty: isDirty.value,
  save,
  deleteItem,
  back,
}));

type SlotBindings = {
  model: T;
  errors: Record<string, string[]>;
  currentLang: string;
  isNew: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isDirty: boolean;
  save: (andBack?: boolean) => Promise<void>;
  deleteItem: () => Promise<void>;
  back: () => void;
};

defineSlots<{
  /** Page title area. Receives full slot bindings. */
  title(props: SlotBindings): VNode[];
  /** Replaces the language switcher in the main column. */
  "body-lang"(props: SlotBindings): VNode[];
  /** Extra content above the main form. */
  "body-top"(props: SlotBindings): VNode[];
  /** Replaces the entire main form. */
  body(props: SlotBindings): VNode[];
  /** Extra content below the main form. */
  "body-bottom"(props: SlotBindings): VNode[];
  /** Replaces the entire sidebar action card (save/delete/back buttons). */
  "side-buttons"(props: SlotBindings): VNode[];
  /** Override just the Save button. */
  "button-save"(props: SlotBindings): VNode[];
  /** Override just the Save & continue button. */
  "button-savecontinue"(props: SlotBindings): VNode[];
  /** Override just the Back button. */
  "button-back"(props: SlotBindings): VNode[];
  /** Override just the Delete button. */
  "button-delete"(props: SlotBindings): VNode[];
  /** Extra content at the top of the sidebar (below action buttons). */
  "side-top"(props: SlotBindings): VNode[];
  /** Extra content at the bottom of the sidebar. */
  "side-bottom"(props: SlotBindings): VNode[];
  /** Per-field form slot. Slot name: `field.{field.key}`. */
  [K: `field.${string}`]: (props: { model: T; currentLang: string }) => VNode[];
}>();
</script>

<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="flex items-center justify-center py-24">
    <UIcon
      name="i-lucide-loader-2"
      class="w-8 h-8 animate-spin text-gray-400"
    />
  </div>

  <div v-else>
    <!-- Title -->
    <slot name="title" v-bind="slotBindings">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {{ isNew ? "New" : "Edit" }}
        <span v-if="modelName"> {{ modelName }}</span>
      </h1>
    </slot>

    <div class="grid grid-cols-12 gap-6 items-start">
      <!-- Main column -->
      <div :class="[mainColsClass, 'space-y-4']">
        <!-- Lang switch -->
        <slot name="body-lang" v-bind="slotBindings">
          <MapoDetailLangSwitch
            v-if="languages && languages.length > 1"
            v-model="currentLang"
            :langs="languages"
            :errors="errors"
          />
        </slot>

        <slot name="body-top" v-bind="slotBindings" />

        <!-- Main form -->
        <slot name="body" v-bind="slotBindings">
          <MapoForm
            v-model="model"
            :fields="fields"
            :errors="errors"
            :languages="languages"
            :current-lang="currentLang"
            :registry="registry"
            :readonly="readonly"
          >
            <template
              v-for="slotName in formSlotNames"
              :key="slotName"
              #[slotName]="slotProps"
            >
              <slot :name="slotName" v-bind="slotProps ?? {}" />
            </template>
          </MapoForm>
        </slot>

        <slot name="body-bottom" v-bind="slotBindings" />
      </div>

      <!-- Sidebar column -->
      <div :class="sidebarColsClass">
        <div :style="sidebarStyle" class="space-y-4">
          <!-- Action buttons -->
          <slot name="side-buttons" v-bind="slotBindings">
            <UCard>
              <div class="flex flex-col gap-2">
                <slot name="button-save" v-bind="slotBindings">
                  <UButton
                    block
                    :loading="isSaving"
                    :disabled="readonly"
                    icon="i-lucide-save"
                    @click="save(true)"
                  >
                    {{ isNew ? "Create" : "Save" }}
                  </UButton>
                </slot>

                <slot name="button-savecontinue" v-bind="slotBindings">
                  <UButton
                    block
                    variant="soft"
                    :loading="isSaving"
                    :disabled="readonly"
                    icon="i-lucide-save"
                    @click="save(false)"
                  >
                    {{ isNew ? "Create and continue" : "Save and continue" }}
                  </UButton>
                </slot>

                <slot name="button-back" v-bind="slotBindings">
                  <UButton
                    block
                    variant="ghost"
                    icon="i-lucide-arrow-left"
                    @click="back"
                  >
                    Back
                  </UButton>
                </slot>

                <slot name="button-delete" v-bind="slotBindings">
                  <UButton
                    v-if="!isNew"
                    block
                    color="error"
                    variant="soft"
                    :loading="isDeleting"
                    :disabled="readonly"
                    icon="i-lucide-trash-2"
                    @click="deleteItem"
                  >
                    Delete
                  </UButton>
                </slot>
              </div>
            </UCard>
          </slot>

          <slot name="side-top" v-bind="slotBindings" />

          <!-- Sidebar fields form -->
          <MapoForm
            v-if="sidebarFields && sidebarFields.length"
            v-model="model"
            :fields="sidebarFields"
            :errors="errors"
            :languages="languages"
            :current-lang="currentLang"
            :registry="registry"
            :readonly="readonly"
          >
            <template
              v-for="slotName in formSlotNames"
              :key="slotName"
              #[slotName]="slotProps"
            >
              <slot :name="slotName" v-bind="slotProps ?? {}" />
            </template>
          </MapoForm>

          <slot name="side-bottom" v-bind="slotBindings" />
        </div>
      </div>
    </div>
  </div>
</template>
