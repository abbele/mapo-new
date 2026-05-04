<script setup lang="ts">
/**
 * News detail/edit — faithful port of ltk_projects/oknoplast-wnd/backoffice/pages/news/_detail.vue
 * from Mapo v1 (Vuetify 2) to Mapo v2 (Nuxt UI v3 + MapoDetail).
 *
 * Original v1 structure:
 *   <WndDetail> with fields.main (PageSeo + Pagina + Prefooter groups)
 *               and fields.sidenav (PageStatus + Extra groups)
 *
 * v2 equivalent: <MapoDetail> with :fields (main column) + :sidebar-fields (right column).
 * Same field structure, same groups, same keys — just declarative TS instead of data() objects.
 *
 * Fields intentionally omitted (require Media Manager — Fase 6):
 *   - image        (type: 'media') — "Immagine ATF"
 *   - og_image     (type: 'media') — Open Graph image
 * These are marked with TODO below.
 *
 * Custom component omitted (requires MapoOverride or Fase 6+):
 *   - template_data.news_footer (is: 'Prefooter') — replaced with individual switch + select fields
 *     which cover the same data without a project-specific custom component.
 */

import type { FieldDescriptor } from "@mapomodule/form/runtime/types/index.js";

definePageMeta({
  layout: "mapo-default",
  middleware: ["auth"],
  parent: "news",
});

const route = useRoute();
const id = computed(() => route.params.id as string);

// Full News model as returned by the Django REST API via Camomilla proxy.
// Flat fields + url_node (read-only routing info) + template_data (JSONField).
interface News {
  id: number;
  // Top-level SEO / routing fields (from PageSeo)
  title: string | null;
  indexable: boolean;
  autopermalink: boolean;
  keywords: string | null;
  breadcrumbs_title: string | null;
  og_title: string | null;
  description: string | null;
  og_description: string | null;
  og_type: string | null;
  og_url: string | null;
  canonical: string | null;
  url_node: { permalink?: string } | null;
  // Publication (from PageStatus)
  status: string;
  publication_date: string | null;
  // Extra
  identifier: string | null;
  ordering: number;
  // Content
  short_desc: string | null;
  content: string | null;
  // Template data (JSONField — nested structure)
  template_data: {
    titles?: { title?: string; sub_title?: string };
    news_footer?: {
      custom_prefooter?: boolean;
      left?: boolean;
      right?: string;
    };
  } | null;
}

// ─── SEO group (PageSeo) ──────────────────────────────────────────────────────
// Direct port of components/common/page-seo.js from WnD v1.
// In v1: spread into fields.main as a group object.
// In v2: same fields in the same group, typed FieldDescriptor array.
const seoFields: FieldDescriptor<News>[] = [
  // TODO: these two are translatable in WnD — add translatable: true when i18n is configured
  {
    key: "title",
    type: "text",
    label: "Title",
    group: "SEO",
    cols: 8,
  },
  {
    key: "indexable",
    type: "switch",
    label: "Indexable",
    group: "SEO",
    cols: 4,
  },
  {
    key: "url_node.permalink",
    type: "text",
    label: "Permalink",
    group: "SEO",
    cols: 8,
    attrs: { disabled: true, placeholder: "(auto-generated)" },
  },
  {
    key: "autopermalink",
    type: "switch",
    label: "Auto-update permalink",
    group: "SEO",
    cols: 4,
  },
  {
    key: "keywords",
    type: "text",
    label: "Keywords (comma separated)",
    group: "SEO",
  },
  {
    key: "breadcrumbs_title",
    type: "text",
    label: "Breadcrumb title",
    group: "SEO",
    cols: 6,
  },
  {
    key: "og_title",
    type: "text",
    label: "OG Title",
    group: "SEO",
    cols: 6,
  },
  {
    key: "description",
    type: "textarea",
    label: "Meta description",
    group: "SEO",
    cols: 6,
  },
  {
    key: "og_description",
    type: "textarea",
    label: "OG Description",
    group: "SEO",
    cols: 6,
  },
  {
    key: "og_type",
    type: "text",
    label: "OG Type",
    group: "SEO",
    cols: 6,
  },
  {
    key: "og_url",
    type: "text",
    label: "OG URL",
    group: "SEO",
    cols: 6,
  },
  {
    key: "canonical",
    type: "text",
    label: "Canonical URL",
    group: "SEO",
  },
  // TODO: og_image — type: 'media' — requires Media Manager (Fase 6)
  // { key: 'og_image', type: 'media', label: 'OG Image', group: 'SEO', cols: 6 },
];

// ─── Page content group ───────────────────────────────────────────────────────
const pageFields: FieldDescriptor<News>[] = [
  {
    key: "template_data.titles.title",
    type: "text",
    label: "Main title",
    group: "Page",
    cols: 6,
  },
  {
    key: "template_data.titles.sub_title",
    type: "text",
    label: "Subtitle (above content)",
    group: "Page",
    cols: 6,
  },
  // TODO: image — type: 'media' — "Immagine ATF" — requires Media Manager (Fase 6)
  // { key: 'image', type: 'media', label: 'ATF Image', group: 'Page' },
  {
    key: "short_desc",
    type: "editor",
    label: "Excerpt / preview text",
    expandable: true,
    group: "Page",
    cols: 6,
  },
  {
    key: "content",
    type: "editor",
    label: "Article body",
    expandable: true,
    group: "Page",
    cols: 6,
  },
];

// ─── Prefooter subgroup ───────────────────────────────────────────────────────
// v1 used is: 'Prefooter' (a custom Vuetify component) for template_data.news_footer.
// In v2, the individual switches/select replicate the same data without a custom component.
// When MapoOverride is used, this group can be replaced with a custom component per project.
const prefooterFields: FieldDescriptor<News>[] = [
  {
    key: "template_data.news_footer.custom_prefooter",
    type: "switch",
    label: "Enable custom prefooter for this article",
    group: "Prefooter",
  },
  {
    key: "template_data.news_footer.left",
    type: "switch",
    label: "Left block active",
    group: "Prefooter",
    cols: 6,
  },
  {
    key: "template_data.news_footer.right",
    type: "select",
    label: "Right block",
    group: "Prefooter",
    cols: 6,
    attrs: {
      items: [
        { label: "Find reseller", value: "find_reseller" },
        { label: "Newsletter", value: "newsletter" },
        { label: "Catalogue", value: "catalogue" },
        { label: "Catalogues", value: "catalogues" },
      ],
      placeholder: "Select block…",
    },
  },
];

// All main fields in order: SEO → Page → Prefooter
const mainFields: FieldDescriptor<News>[] = [
  ...seoFields,
  ...pageFields,
  ...prefooterFields,
];

// ─── Sidebar fields (PageStatus + Extra) ─────────────────────────────────────
// Direct port of components/common/page-status.js from WnD v1.
const sidebarFields: FieldDescriptor<News>[] = [
  // Status group (PageStatus)
  {
    key: "status",
    type: "select",
    label: "Status",
    group: "Status",
    attrs: {
      items: [
        { label: "Draft", value: "DRF" },
        { label: "Published", value: "PUB" },
        { label: "Trash", value: "TRS" },
      ],
    },
  },
  {
    key: "publication_date",
    type: "date",
    label: "Publication date",
    group: "Status",
  },
  // Extra group
  {
    key: "identifier",
    type: "text",
    label: "Identifier",
    group: "Extra",
  },
  {
    key: "ordering",
    type: "number",
    label: 'Order (higher = appears in "most read")',
    group: "Extra",
    attrs: { min: 0 },
  },
];
</script>

<template>
  <!--
    <MapoDetail> replicates WndDetail from the v1 WnD backoffice:
      - endpoint + id → GET/PATCH/POST/DELETE on /api/models/news/
      - :fields → main column (SEO group + Pagina group + Prefooter group)
      - :sidebar-fields → right sticky column (Status + Extra groups)

    Two media fields are missing pending Media Manager (Fase 6):
      - image (Immagine ATF)
      - og_image (Open Graph image)
    Add them back as type: 'media' once @mapomodule/uikit exports MapoMediaField.

    The Prefooter group uses individual descriptors instead of the custom v1
    <Prefooter> Vuetify component. Override via mapooverride/ if needed.

    Slots available for project-level customization:
      #side-bottom="{ model }"  → below sidebar (e.g. "View on site" link)
      #body-bottom="{ model }"  → below main fields (e.g. preview panel)
      #button-save              → replace the Save button
  -->
  <div class="p-6">
    <MapoDetail
      :id="id"
      endpoint="/api/models/news"
      :fields="mainFields"
      :sidebar-fields="sidebarFields"
      model-name="News"
    >
      <template #side-bottom="{ model }">
        <UButton
          v-if="model.status === 'PUB' && model.identifier"
          variant="outline"
          color="neutral"
          icon="i-lucide-external-link"
          size="xs"
          class="w-full mt-2"
          :to="`https://wnd.it/news/${model.identifier}/`"
          target="_blank"
          external
        >
          View on site
        </UButton>
      </template>
    </MapoDetail>
  </div>
</template>
