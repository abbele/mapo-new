<script setup lang="ts">
/**
 * Pagina di dettaglio/modifica articolo — powered by MapoDetail.
 *
 * ✅ Cosa ottieni GRATIS con <MapoDetail>:
 *  - Fetch automatico dell'oggetto tramite useCrud (endpoint + id)
 *  - Salvataggio con PATCH differenziale (solo i campi modificati viaggiano sul wire)
 *  - Unsaved changes guard: dialog di conferma se l'utente naviga via con modifiche pendenti
 *  - window.beforeunload per chiusura tab
 *  - Errori 400 dal backend → automaticamente mappati sui singoli field
 *  - Layout responsive 2 colonne (main + sidebar sticky)
 *  - Lang switch con badge rosso sulle lingue con errori
 *  - Snack di successo/errore
 *  - Confirm dialog per il delete
 *
 * ✅ Cosa definisci tu:
 *  - endpoint: la base URL del tuo CRUD REST
 *  - id: l'id del record (o "new" per la creazione)
 *  - fields: i descriptor del form principale
 *  - sidebarFields: i descriptor della colonna laterale
 *  - languages: le lingue disponibili per i campi translatable
 *
 * ✅ Ogni campo è un semplice oggetto:
 *    { key: 'title', type: 'text', label: 'Titolo', translatable: true }
 *  — niente Vuetify, niente v-model manuale, niente binding di errori.
 */

import type { FieldDescriptor } from "@mapomodule/form/runtime/types/index.js";

definePageMeta({
  layout: "mapo-default",
});

const route = useRoute();
const id = computed(() => route.params.id as string);

interface Article {
  id: number;
  title: string;
  slug: string;
  body: string;
  status: string;
  is_featured: boolean;
  published_at: string | null;
  priority: number;
  translations: Record<string, { title?: string; body?: string }>;
}

// ─── Descriptor del form principale ──────────────────────────────────────────
// translatable: true → il valore viene letto/scritto dentro model.translations[lang].*
// synci18n: true    → il valore è uguale per tutte le lingue (non tradotto)
const mainFields: FieldDescriptor<Article>[] = [
  {
    key: "title",
    type: "text",
    label: "Titolo",
    translatable: true, // it: translations.it.title / en: translations.en.title
    required: true,
  },
  {
    key: "slug",
    type: "text",
    label: "Slug",
    synci18n: true, // campo shared tra tutte le lingue
    attrs: { placeholder: "my-article-slug" },
  },
  {
    key: "body",
    type: "editor", // Tiptap WYSIWYG — basta "editor" nel type
    label: "Contenuto",
    translatable: true,
  },
];

// ─── Descriptor della sidebar ─────────────────────────────────────────────────
// Vanno nella colonna destra sticky. Stessa sintassi del form principale.
const sidebarFields: FieldDescriptor<Article>[] = [
  {
    key: "status",
    type: "select",
    label: "Stato",
    synci18n: true,
    attrs: {
      items: [
        { label: "Bozza", value: "draft" },
        { label: "Pubblicato", value: "published" },
        { label: "Archiviato", value: "archived" },
      ],
    },
  },
  {
    key: "is_featured",
    type: "switch",
    label: "In evidenza",
    synci18n: true,
  },
  {
    key: "priority",
    type: "number",
    label: "Priorità",
    synci18n: true,
    attrs: { min: 1, max: 10 },
  },
  {
    key: "published_at",
    type: "datetime",
    label: "Data pubblicazione",
    synci18n: true,
  },
];
</script>

<template>
  <div class="p-6">
    <!--
      MapoDetail fa tutto il lavoro pesante:
        - endpoint + id → fetch automatico on mount
        - :fields → form principale (colonna larga)
        - :sidebar-fields → form laterale (colonna sticky)
        - :languages → abilita il lang switch e la modalità translatable
        - :registry → il registry globale dei field type (iniettato dal plugin)

      Per creare un nuovo articolo basta mettere id="new" — MapoDetail
      usa POST invece di PATCH e poi fa redirect all'id restituito dal backend.

      Vuoi sovrascrivere un bottone? Usa gli slot:
        <template #button-save="{ save, isSaving }">
          <MyCustomButton @click="save(false)" :loading="isSaving" />
        </template>

      Vuoi aggiungere contenuto in fondo alla sidebar?
        <template #side-bottom="{ model }">
          <pre>{{ model }}</pre>
        </template>
    -->
    <MapoDetail
      endpoint="/api/mock/articles"
      :id="id"
      :fields="mainFields"
      :sidebar-fields="sidebarFields"
      :languages="['it', 'en']"
      model-name="Articolo"
    />
  </div>
</template>
