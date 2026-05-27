<script setup lang="ts">
import { watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    langs: string[];
    errors?: Record<string, string[]>;
    noRouteChange?: boolean;
  }>(),
  {
    errors: () => ({}),
    noRouteChange: false,
  },
);

const emit = defineEmits<{ (e: "update:modelValue", lang: string): void }>();

const route = useRoute();
const router = useRouter();

function hasErrors(lang: string): boolean {
  const prefix = `translations.${lang}.`;
  return Object.keys(props.errors || {}).some((k) => k.startsWith(prefix));
}

function selectLang(lang: string) {
  emit("update:modelValue", lang);
  if (!props.noRouteChange && route.query.lang !== lang) {
    router.replace({ query: { ...route.query, lang } });
  }
}

onMounted(() => {
  const queryLang = route.query.lang as string | undefined;
  if (
    queryLang &&
    props.langs.includes(queryLang) &&
    queryLang !== props.modelValue
  ) {
    emit("update:modelValue", queryLang);
  }
});

watch(
  () => props.modelValue,
  (val) => {
    if (!props.noRouteChange && route.query.lang !== val) {
      router.replace({ query: { ...route.query, lang: val } });
    }
  },
);
</script>

<template>
  <div class="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-4">
    <button
      v-for="lang in langs"
      :key="lang"
      type="button"
      class="relative px-4 py-2 text-sm font-medium transition-colors focus:outline-none"
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
