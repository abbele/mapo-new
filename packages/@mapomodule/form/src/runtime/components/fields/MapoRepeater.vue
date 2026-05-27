<script setup lang="ts">
import { ref, computed } from "vue";
import type { RepeaterDescriptor } from "../../types/index.js";
import { injectMapoForm } from "../../composables/useMapoForm.js";
import MapoRepeaterItem from "./MapoRepeaterItem.vue";

const props = defineProps<{
  modelValue: unknown;
  descriptor: RepeaterDescriptor;
  errors?: string[];
  readonly?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{ "update:modelValue": [value: unknown[]] }>();

const form = injectMapoForm()!;

const attrs = computed(() => props.descriptor.attrs ?? {});

// ─── Item list (reactive local copy) ────────────────────────────────────────

const items = computed<Record<string, unknown>[]>({
  get: () =>
    (Array.isArray(props.modelValue) ? props.modelValue : []) as Record<
      string,
      unknown
    >[],
  set: (val) => emit("update:modelValue", val),
});

function emitItems(newItems: Record<string, unknown>[]) {
  emit("update:modelValue", [...newItems]);
}

// Stable per-item UID: guarantees persistent :key values across reorder/duplicate.
// Without this, Vue may reuse instances on the wrong item after splice/swap operations.
const itemUids = new WeakMap<object, string>();
let _uidSeq = 0;
function uidFor(item: Record<string, unknown>): string {
  let id = itemUids.get(item);
  if (!id) {
    id = `it_${++_uidSeq}`;
    itemUids.set(item, id);
  }
  return id;
}

// ─── Undo stack ──────────────────────────────────────────────────────────────

const undoStack = ref<Record<string, unknown>[][]>([]);

function pushUndo() {
  undoStack.value.push(items.value.map((i) => ({ ...i })));
  if (undoStack.value.length > 20) undoStack.value.shift();
}

function undo() {
  const prev = undoStack.value.pop();
  if (prev) emit("update:modelValue", prev);
}

// ─── Template selection ──────────────────────────────────────────────────────

const templates = computed(() => attrs.value.templates);
const templateKeys = computed(() =>
  templates.value ? Object.keys(templates.value) : [],
);
const hasTemplates = computed(() => templateKeys.value.length > 0);
const selectedTemplate = ref(templateKeys.value[0] ?? "");

function fieldsForItem(item: Record<string, unknown>) {
  if (!templates.value) return props.descriptor.fields;
  const key = (item._template as string) ?? selectedTemplate.value;
  return templates.value[key] ?? props.descriptor.fields;
}

// ─── Item CRUD ───────────────────────────────────────────────────────────────

const canAdd = computed(
  () =>
    !props.readonly &&
    (!attrs.value.maxItems || items.value.length < attrs.value.maxItems),
);
const canDelete = computed(
  () =>
    !props.readonly &&
    (!attrs.value.minItems || items.value.length > attrs.value.minItems),
);

function addItem() {
  if (!canAdd.value) return;
  pushUndo();
  const newItem: Record<string, unknown> = hasTemplates.value
    ? { _template: selectedTemplate.value }
    : {};
  emitItems([...items.value, newItem]);
}

async function deleteItem(index: number) {
  if (!canDelete.value) return;
  if (attrs.value.confirmDelete !== false) {
    let confirmed: boolean;
    try {
      // @ts-expect-error — Nuxt auto-import, available when @mapomodule/store is installed
      confirmed = await useConfirmStore().ask({
        title: "Delete item",
        message: "Are you sure you want to delete this item?",
      });
    } catch {
      confirmed = window.confirm("Are you sure you want to delete this item?");
    }
    if (!confirmed) return;
  }
  pushUndo();
  const next = [...items.value];
  next.splice(index, 1);
  emitItems(next);
}

function duplicateItem(index: number) {
  pushUndo();
  const copy = { ...items.value[index] };
  const next = [...items.value];
  next.splice(index + 1, 0, copy);
  emitItems(next);
}

function updateItem(index: number, val: Record<string, unknown>) {
  const next = [...items.value];
  next[index] = val;
  emitItems(next);
}

function moveUp(index: number) {
  if (index === 0) return;
  pushUndo();
  const next = [...items.value];
  [next[index - 1], next[index]] = [next[index], next[index - 1]];
  emitItems(next);
}

function moveDown(index: number) {
  if (index >= items.value.length - 1) return;
  pushUndo();
  const next = [...items.value];
  [next[index], next[index + 1]] = [next[index + 1], next[index]];
  emitItems(next);
}

function moveTo(from: number, to: number) {
  if (to < 0 || to >= items.value.length || from === to) return;
  pushUndo();
  const next = [...items.value];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  emitItems(next);
}

// ─── Global collapse/expand ──────────────────────────────────────────────────

const collapseVersion = ref(0);
const globalExpanded = ref(attrs.value.defaultExpanded ?? false);

function collapseAll() {
  globalExpanded.value = false;
  collapseVersion.value++;
}
function expandAll() {
  globalExpanded.value = true;
  collapseVersion.value++;
}

// ─── Drag & drop (SSR-safe via ClientOnly) ───────────────────────────────────

function onDragEnd(evt: { oldIndex: number; newIndex: number }) {
  if (evt.oldIndex === evt.newIndex) return;
  pushUndo();
  const next = [...items.value];
  const [item] = next.splice(evt.oldIndex, 1);
  next.splice(evt.newIndex, 0, item);
  emitItems(next);
}

// ─── Bulk actions ────────────────────────────────────────────────────────────

const selectionMode = ref(false);
const selectedIndices = ref<Set<number>>(new Set());
const lastSelected = ref<number | null>(null);

function toggleSelectionMode() {
  selectionMode.value = !selectionMode.value;
  if (!selectionMode.value) {
    selectedIndices.value.clear();
    lastSelected.value = null;
  }
}

function toggleSelect(index: number) {
  const next = new Set(selectedIndices.value);
  if (next.has(index)) {
    next.delete(index);
  } else {
    next.add(index);
  }
  selectedIndices.value = next;
  lastSelected.value = index;
}

function selectAll() {
  selectedIndices.value = new Set(items.value.map((_, i) => i));
}

function clearSelection() {
  selectedIndices.value = new Set();
}

async function bulkDelete() {
  if (!canDelete.value || selectedIndices.value.size === 0) return;
  const confirmed = window.confirm(
    `Delete ${selectedIndices.value.size} selected items?`,
  );
  if (!confirmed) return;
  pushUndo();
  const indicesToRemove = new Set(selectedIndices.value);
  emitItems(items.value.filter((_, i) => !indicesToRemove.has(i)));
  selectedIndices.value = new Set();
}

function bulkDuplicate() {
  if (selectedIndices.value.size === 0) return;
  pushUndo();
  const sorted = [...selectedIndices.value].sort((a, b) => a - b);
  const next = [...items.value];
  // Insert copies in reverse order so indices do not shift.
  let offset = 0;
  for (const idx of sorted) {
    const insertAt = idx + 1 + offset;
    next.splice(insertAt, 0, { ...items.value[idx] });
    offset++;
  }
  emitItems(next);
  selectedIndices.value = new Set();
}

function bulkMoveToTop() {
  if (selectedIndices.value.size === 0) return;
  pushUndo();
  const sorted = [...selectedIndices.value].sort((a, b) => a - b);
  const selected = sorted.map((i) => items.value[i]);
  const rest = items.value.filter((_, i) => !selectedIndices.value.has(i));
  emitItems([...selected, ...rest]);
  selectedIndices.value = new Set();
}

const hasSelection = computed(() => selectedIndices.value.size > 0);
const selectionCount = computed(() => selectedIndices.value.size);

// ─── Errors ──────────────────────────────────────────────────────────────────

const parentErrors = computed(() => form.errors.value);
const errorPrefix = (index: number) =>
  `${props.descriptor.key as string}.${index}`;
</script>

<template>
  <div class="mapo-repeater space-y-2">
    <!-- ── Main toolbar ────────────────────────────────────────────────────── -->
    <div
      class="flex flex-wrap items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2"
    >
      <span class="text-sm font-medium text-gray-700">
        {{ items.length }} {{ items.length === 1 ? "item" : "items" }}
        <span v-if="attrs.maxItems" class="text-gray-400"
          >/ {{ attrs.maxItems }}</span
        >
      </span>

      <div class="flex flex-1 flex-wrap items-center justify-end gap-2">
        <UButton size="xs" variant="ghost" color="neutral" @click="collapseAll">
          Collapse all
        </UButton>
        <UButton size="xs" variant="ghost" color="neutral" @click="expandAll">
          Expand all
        </UButton>
        <UButton
          v-if="undoStack.length"
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-lucide-undo-2"
          title="Undo last action"
          @click="undo"
        />

        <!-- Bulk selection mode -->
        <UButton
          size="xs"
          :variant="selectionMode ? 'solid' : 'ghost'"
          color="neutral"
          icon="i-lucide-check-square"
          title="Bulk selection"
          :label="selectionMode ? 'Exit selection' : 'Select'"
          @click="toggleSelectionMode"
        />

        <!-- Template selector -->
        <USelectMenu
          v-if="hasTemplates"
          v-model="selectedTemplate"
          :items="templateKeys"
          size="xs"
          class="w-32"
        />

        <UButton
          size="sm"
          color="primary"
          icon="i-lucide-plus"
          :disabled="!canAdd"
          @click="addItem"
        >
          Add
        </UButton>
      </div>
    </div>

    <!-- ── Bulk actions bar (visible when there is a selection) ───────────── -->
    <Transition name="slide-down">
      <div
        v-if="selectionMode && hasSelection"
        class="flex items-center gap-2 rounded border border-primary-200 bg-primary-50 px-3 py-2"
      >
        <span class="text-sm font-medium text-primary-700">
          {{ selectionCount }} selected
        </span>
        <div class="flex flex-1 flex-wrap items-center gap-2">
          <UButton size="xs" variant="ghost" color="neutral" @click="selectAll">
            All
          </UButton>
          <UButton
            size="xs"
            variant="ghost"
            color="neutral"
            @click="clearSelection"
          >
            Clear
          </UButton>
          <UButton
            size="xs"
            variant="outline"
            color="neutral"
            icon="i-lucide-copy"
            :disabled="!canAdd"
            @click="bulkDuplicate"
          >
            Duplicate ({{ selectionCount }})
          </UButton>
          <UButton
            size="xs"
            variant="outline"
            color="neutral"
            icon="i-lucide-arrow-up"
            @click="bulkMoveToTop"
          >
            Move to top
          </UButton>
          <UButton
            size="xs"
            variant="outline"
            color="error"
            icon="i-lucide-trash-2"
            :disabled="!canDelete"
            @click="bulkDelete"
          >
            Elimina ({{ selectionCount }})
          </UButton>
        </div>
      </div>
    </Transition>

    <!-- ── Lista items con drag&drop (ClientOnly per SSR) ─────────────────── -->
    <ClientOnly>
      <VueDraggable
        :model-value="items"
        handle=".drag-handle"
        animation="150"
        @end="onDragEnd"
      >
        <MapoRepeaterItem
          v-for="(item, index) in items"
          :key="`${uidFor(item)}-${collapseVersion}`"
          :item="item"
          :fields="fieldsForItem(item)"
          :index="index"
          :error-prefix="errorPrefix(index)"
          :parent-errors="parentErrors"
          :languages="form.languages"
          :current-lang="form.currentLang.value"
          :readonly="readonly ?? false"
          :registry="form.registry"
          :preview-label="attrs.previewLabel"
          :default-expanded="globalExpanded"
          :allow-duplicate="attrs.allowDuplicate"
          :repeater-descriptor="descriptor"
          :total-items="items.length"
          :selected="selectedIndices.has(index)"
          :selection-mode="selectionMode"
          @update:item="updateItem(index, $event)"
          @delete="deleteItem(index)"
          @duplicate="duplicateItem(index)"
          @move-up="moveUp(index)"
          @move-down="moveDown(index)"
          @move-to="moveTo(index, $event)"
          @toggle-select="toggleSelect(index)"
        />
      </VueDraggable>

      <!-- Fallback SSR: lista senza drag -->
      <template #fallback>
        <MapoRepeaterItem
          v-for="(item, index) in items"
          :key="`${uidFor(item)}-${collapseVersion}`"
          :item="item"
          :fields="fieldsForItem(item)"
          :index="index"
          :error-prefix="errorPrefix(index)"
          :parent-errors="parentErrors"
          :languages="form.languages"
          :current-lang="form.currentLang.value"
          :readonly="readonly ?? false"
          :registry="form.registry"
          :preview-label="attrs.previewLabel"
          :default-expanded="globalExpanded"
          :allow-duplicate="attrs.allowDuplicate"
          :repeater-descriptor="descriptor"
          :total-items="items.length"
          :selected="selectedIndices.has(index)"
          :selection-mode="selectionMode"
          @update:item="updateItem(index, $event)"
          @delete="deleteItem(index)"
          @duplicate="duplicateItem(index)"
          @move-up="moveUp(index)"
          @move-down="moveDown(index)"
          @move-to="moveTo(index, $event)"
          @toggle-select="toggleSelect(index)"
        />
      </template>
    </ClientOnly>

    <!-- ── Stato vuoto ─────────────────────────────────────────────────────── -->
    <div
      v-if="items.length === 0"
      class="rounded border border-dashed border-gray-300 py-8 text-center text-sm text-gray-400"
    >
      Nessun elemento. Clicca "Aggiungi" per iniziare.
    </div>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition:
    grid-template-rows 250ms ease,
    opacity 200ms ease;
  display: grid;
}
.slide-down-enter-from,
.slide-down-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  grid-template-rows: 1fr;
  opacity: 1;
}
</style>
