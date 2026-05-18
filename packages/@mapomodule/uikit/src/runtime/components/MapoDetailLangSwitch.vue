<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    langs: string[];
    errors?: Record<string, string[]>;
    noRouteChange?: boolean;
    /**
     * Number of languages above which the tab bar is replaced by a searchable
     * select menu. Default: `8`. Set to `0` to always use the select menu, or
     * to a very large number to always use tabs.
     */
    langThreshold?: number;
  }>(),
  {
    errors: () => ({}),
    noRouteChange: false,
    langThreshold: 8,
  },
);

const emit = defineEmits<{ (e: "update:modelValue", lang: string): void }>();

const route = useRoute();
const router = useRouter();

const useSelect = computed(() => props.langs.length > props.langThreshold);

// ─── Tab refs for scrollIntoView ─────────────────────────────────────────────

const tabRefs = ref<Record<string, HTMLElement | null>>({});

function setTabRef(lang: string, el: Element | null) {
  tabRefs.value[lang] = el as HTMLElement | null;
}

function scrollActiveIntoView(lang: string) {
  nextTick(() => {
    tabRefs.value[lang]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasErrors(lang: string): boolean {
  const prefix = `translations.${lang}.`;
  return Object.keys(props.errors || {}).some((k) => k.startsWith(prefix));
}

function selectLang(lang: string) {
  emit("update:modelValue", lang);
  if (!props.noRouteChange && route.query.lang !== lang) {
    router.replace({ query: { ...route.query, lang } });
  }
  scrollActiveIntoView(lang);
}

// ─── Select menu items ────────────────────────────────────────────────────────

const selectItems = computed(() =>
  props.langs.map((lang) => ({
    label: lang.toUpperCase(),
    value: lang,
    trailingIcon: hasErrors(lang) ? "i-lucide-alert-circle" : undefined,
  })),
);

const selectValue = computed({
  get: () => props.modelValue,
  set: (v: string) => selectLang(v),
});

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  const queryLang = route.query.lang as string | undefined;
  if (
    queryLang &&
    props.langs.includes(queryLang) &&
    queryLang !== props.modelValue
  ) {
    emit("update:modelValue", queryLang);
  }
  scrollActiveIntoView(props.modelValue);
});

watch(
  () => props.modelValue,
  (val) => {
    if (!props.noRouteChange && route.query.lang !== val) {
      router.replace({ query: { ...route.query, lang: val } });
    }
    scrollActiveIntoView(val);
  },
);
</script>

<template>
  <!-- Select menu — used when langs > langThreshold -->
  <USelectMenu
    v-if="useSelect"
    v-model="selectValue"
    :items="selectItems"
    value-attribute="value"
    option-attribute="label"
    size="sm"
    class="w-40 mb-4"
  >
    <template #leading>
      <span
        v-if="hasErrors(modelValue)"
        class="inline-block h-2 w-2 rounded-full bg-red-500 mr-1"
      />
    </template>
  </USelectMenu>

  <!-- Tab bar — used when langs <= langThreshold -->
  <div
    v-else
    class="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700 mb-4 scrollbar-none"
  >
    <button
      v-for="lang in langs"
      :key="lang"
      :ref="(el) => setTabRef(lang, el as Element | null)"
      type="button"
      class="relative shrink-0 px-4 py-2 text-sm font-medium transition-colors focus:outline-none"
      :class="[
        lang === modelValue
          ? 'text-primary-600 border-b-2 border-primary-600 -mb-px'
          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
      ]"
      @click="selectLang(lang)"
    >
      {{ lang.toUpperCase() }}
      <span
        v-if="hasErrors(lang)"
        class="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"
      />
    </button>
  </div>
</template>
