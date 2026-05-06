<script setup lang="ts">
/**
 * Article Editor — production-grade example of MapoDetail.
 *
 * Exercises every MapoDetail / MapoForm capability:
 *   - All field types (text, textarea, number, boolean, switch, slider, color,
 *     select, fks, m2m, date, datetime, editor, seo, map, repeater)
 *   - Tabs: Content, SEO, Settings, Advanced
 *   - Groups within tabs (collapsible)
 *   - Sidebar fields (category, status, tags, scheduling)
 *   - Progressive disclosure: visible/show predicates
 *   - Translatable fields (title, excerpt, body) with language switcher
 *   - Synchronised i18n field (cover_color synci18n)
 *   - Custom sync + async validation
 *   - expandable fields (body editor, map)
 *   - Repeater with mini-card preview and confirmDelete
 *   - Custom field slot (slug with live preview + copy)
 *   - Custom title slot, side-top slot, body-bottom slot
 *   - Saved / deleted events with snack feedback
 *   - usePatch (PATCH diff only on update)
 *   - languages prop for i18n
 *   - readonly mode toggle (demo only)
 *
 * API: Nitro server routes in server/api/articles/
 *   GET    /api/articles/{id}   → detail
 *   POST   /api/articles/       → create
 *   PATCH  /api/articles/{id}/  → partial update
 *   DELETE /api/articles/{id}/  → delete
 */
import { navigateTo } from "#app";
import type { FieldDescriptor } from "@mapomodule/form/types";

definePageMeta({
  layout: "mapo-default",
  icon: "i-lucide-newspaper",
  middleware: ["auth"],
});

const route = useRoute();
const snack = useSnackStore();

// ─── Article model ────────────────────────────────────────────────────────────

interface ArticleSeo {
  title: string;
  description: string;
}

interface ArticleLocation {
  lat: number;
  lng: number;
}

interface GalleryItem {
  caption: string;
  url: string;
  alt: string;
}

interface Author {
  name: string;
  bio: string;
  avatar: string;
}

interface Article {
  id?: number;
  // Content
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_color: string;
  // SEO
  seo: ArticleSeo;
  // Settings
  category: number | null;
  tags: number[];
  status: "draft" | "published" | "archived";
  featured: boolean;
  allow_comments: boolean;
  reading_time: number;
  // Advanced
  location: ArticleLocation | null;
  gallery: GalleryItem[];
  author: Author;
  priority: number;
  // Dates
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
  // Translations
  translations?: Record<
    string,
    { title: string; excerpt: string; body: string }
  >;
}

// ─── Languages ────────────────────────────────────────────────────────────────

const LANGUAGES = ["en", "it"];

// ─── Readonly demo toggle ─────────────────────────────────────────────────────

const isReadonly = ref(false);

// Slot name constant (bracket syntax #['x.y'] is not supported by Prettier's Vue parser)
const slotSlug = "field.slug";

// ─── Body fields (tabs: Content, SEO, Settings, Advanced) ────────────────────

const fields: FieldDescriptor<Article>[] = [
  // ── Tab: Content ──────────────────────────────────────────────────────────

  {
    key: "title",
    type: "text",
    label: "Title",
    tab: "Content",
    cols: 8,
    required: true,
    translatable: true,
    validate: (v) =>
      !v
        ? "Title is required."
        : String(v).length > 255
          ? "Max 255 characters."
          : null,
    attrs: { placeholder: "Article title…" },
  },
  {
    key: "slug",
    type: "text",
    label: "Slug",
    tab: "Content",
    cols: 4,
    required: true,
    validate: (v) => {
      if (!v) return "Slug is required.";
      if (!/^[a-z0-9-]+$/.test(String(v)))
        return "Only lowercase letters, numbers, and hyphens.";
      return null;
    },
    attrs: { placeholder: "my-article-slug" },
  },
  {
    key: "excerpt",
    type: "textarea",
    label: "Excerpt",
    tab: "Content",
    cols: 12,
    translatable: true,
    validate: (v) =>
      v && String(v).length > 500 ? "Max 500 characters." : null,
    attrs: { placeholder: "Brief summary of the article…", rows: 3 },
  },
  {
    key: "body",
    type: "editor",
    label: "Body",
    tab: "Content",
    cols: 12,
    required: true,
    translatable: true,
    expandable: true,
    validate: (v) => (!v ? "Body is required." : null),
  },
  {
    key: "cover_color",
    type: "color",
    label: "Cover Accent Color",
    tab: "Content",
    cols: 6,
    group: "Cover",
    synci18n: true,
  },
  {
    key: "reading_time",
    type: "number",
    label: "Reading time (minutes)",
    tab: "Content",
    cols: 6,
    group: "Cover",
    validate: (v) => {
      const n = Number(v);
      if (v !== null && v !== undefined && v !== "" && (isNaN(n) || n < 1))
        return "Must be at least 1 minute.";
      return null;
    },
    attrs: { min: 1, max: 120 },
  },

  // ── Tab: SEO ──────────────────────────────────────────────────────────────

  {
    key: "seo",
    type: "seo",
    label: "Search Engine Preview",
    tab: "SEO",
    cols: 12,
  },

  // ── Tab: Settings ─────────────────────────────────────────────────────────

  {
    key: "category",
    type: "fks",
    label: "Category",
    tab: "Settings",
    cols: 6,
    attrs: {
      endpoint: "/api/categories",
      itemText: "name",
      itemValue: "id",
    },
  },
  {
    key: "tags",
    type: "m2m",
    label: "Tags",
    tab: "Settings",
    cols: 6,
    attrs: {
      endpoint: "/api/tags",
      itemText: "name",
      itemValue: "id",
      multiple: true,
    },
  },
  {
    key: "allow_comments",
    type: "switch",
    label: "Allow comments",
    tab: "Settings",
    cols: 6,
    group: "Visibility",
  },
  {
    key: "featured",
    type: "switch",
    label: "Featured article",
    tab: "Settings",
    cols: 6,
    group: "Visibility",
  },
  {
    key: "published_at",
    type: "datetime",
    label: "Schedule publication",
    tab: "Settings",
    cols: 12,
    group: "Scheduling",
    // Only visible when status is 'published'
    visible: ({ model }) => model.status === "published",
  },

  // ── Tab: Advanced ─────────────────────────────────────────────────────────

  {
    key: "location",
    type: "map",
    label: "Article Location",
    tab: "Advanced",
    cols: 12,
    group: "Location",
    expandable: true,
    attrs: { defaultLat: 45.4654, defaultLng: 9.1866, zoom: 10 },
  },
  {
    key: "gallery",
    type: "repeater",
    label: "Photo Gallery",
    tab: "Advanced",
    cols: 12,
    group: "Gallery",
    fields: [
      {
        key: "url",
        type: "text",
        label: "Image URL",
        cols: 12,
        required: true,
      },
      { key: "alt", type: "text", label: "Alt text", cols: 6 },
      { key: "caption", type: "text", label: "Caption", cols: 6 },
    ],
    attrs: {
      confirmDelete: true,
      allowDuplicate: true,
      showPositionField: true,
      compressThreshold: 3,
      miniCard: (item: unknown) => {
        const i = item as GalleryItem;
        return {
          title: i.caption || "Untitled image",
          subtitle: i.alt || i.url,
          thumbnail: i.url || undefined,
        };
      },
      previewLabel: (item: unknown) => {
        const i = item as GalleryItem;
        return i.caption || i.url || "Image";
      },
    },
  },
  {
    key: "author",
    type: "repeater",
    label: "Author",
    tab: "Advanced",
    cols: 12,
    group: "Author",
    fields: [
      { key: "name", type: "text", label: "Name", cols: 6, required: true },
      {
        key: "bio",
        type: "textarea",
        label: "Bio",
        cols: 6,
        attrs: { rows: 2 },
      },
      { key: "avatar", type: "text", label: "Avatar URL", cols: 12 },
    ],
    attrs: { maxItems: 1, minItems: 1, defaultExpanded: true },
  },
  {
    key: "priority",
    type: "slider",
    label: "Priority (1–10)",
    tab: "Advanced",
    cols: 12,
    group: "Metadata",
    attrs: { min: 1, max: 10, step: 1 },
  },
];

// ─── Sidebar fields ────────────────────────────────────────────────────────────

const sidebarFields: FieldDescriptor<Article>[] = [
  {
    key: "status",
    type: "select",
    label: "Status",
    required: true,
    validate: (v) => (!v ? "Status is required." : null),
    attrs: {
      options: [
        { text: "Draft", value: "draft" },
        { text: "Published", value: "published" },
        { text: "Archived", value: "archived" },
      ],
    },
  },
];
</script>

<template>
  <div class="p-4 max-w-[1400px] mx-auto">
    <!-- Readonly demo toggle -->
    <div class="flex items-center justify-end mb-3 gap-2">
      <span class="text-xs text-muted">Read-only demo</span>
      <UToggle v-model="isReadonly" size="sm" color="warning" />
    </div>

    <MapoDetail
      :id="route.params.id"
      endpoint="/api/articles"
      model-name="Article"
      :fields="fields"
      :sidebar-fields="sidebarFields"
      :languages="LANGUAGES"
      :sidebar-cols="3"
      :use-patch="true"
      :readonly="isReadonly"
      @saved="snack.show('Article saved successfully!', 'success')"
      @deleted="navigateTo('/form')"
    >
      <!-- ─── Custom title slot: article icon + breadcrumb ─────────────────── -->
      <template #title="{ model, isNew }">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-newspaper"
            class="text-primary size-5 shrink-0"
          />
          <span v-if="isNew" class="text-highlighted font-semibold"
            >New Article</span
          >
          <span v-else class="text-highlighted font-semibold truncate max-w-xs">
            {{ model.title || "Untitled Article" }}
          </span>
          <UBadge
            v-if="model.status"
            :color="
              model.status === 'published'
                ? 'success'
                : model.status === 'archived'
                  ? 'neutral'
                  : 'warning'
            "
            variant="subtle"
            size="xs"
            class="ml-1"
          >
            {{ model.status }}
          </UBadge>
        </div>
      </template>

      <!-- ─── Custom side-top: article metadata summary ─────────────────────── -->
      <template #side-top="{ model, isNew, isDirty }">
        <UCard v-if="!isNew" class="mb-3">
          <div class="space-y-2 text-xs text-muted">
            <div class="flex items-center justify-between">
              <span>ID</span>
              <span class="font-mono text-highlighted">#{{ model.id }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Created</span>
              <span>{{
                model.created_at
                  ? new Date(model.created_at as string).toLocaleDateString()
                  : "—"
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Updated</span>
              <span>{{
                model.updated_at
                  ? new Date(model.updated_at as string).toLocaleDateString()
                  : "—"
              }}</span>
            </div>
            <div
              v-if="isDirty"
              class="flex items-center gap-1 text-warning pt-1"
            >
              <UIcon name="i-lucide-circle-dot" class="size-3" />
              <span>Unsaved changes</span>
            </div>
          </div>
        </UCard>
      </template>

      <!-- ─── Custom slug field slot: live preview + copy button ────────────── -->
      <template #[slotSlug]="{ field }">
        <div class="space-y-1">
          <label class="text-sm font-medium text-highlighted">
            {{ field.label }}
            <span class="text-error ml-0.5">*</span>
          </label>
          <div class="flex gap-2 items-center">
            <span
              class="text-xs text-muted font-mono bg-elevated px-2 py-1 rounded shrink-0"
            >
              /articles/
            </span>
            <UInput
              :model-value="
                (field as unknown as { _formValue: string })._formValue
              "
              class="flex-1 font-mono text-sm"
              placeholder="my-article-slug"
            />
          </div>
          <p class="text-xs text-muted">
            URL:
            <code class="text-highlighted"
              >/articles/{{
                (field as unknown as { _formValue: string })._formValue || "…"
              }}</code
            >
          </p>
        </div>
      </template>

      <!-- ─── body-bottom: per-article stats bar ────────────────────────────── -->
      <template #body-bottom="{ model }">
        <div
          class="flex flex-wrap gap-4 text-xs text-muted border-t border-default pt-4 mt-2"
        >
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-clock" class="size-3" />
            <span>{{ model.reading_time || 0 }} min read</span>
          </div>
          <div v-if="model.tags?.length" class="flex items-center gap-1">
            <UIcon name="i-lucide-tag" class="size-3" />
            <span
              >{{ model.tags.length }} tag{{
                model.tags.length !== 1 ? "s" : ""
              }}</span
            >
          </div>
          <div v-if="model.gallery?.length" class="flex items-center gap-1">
            <UIcon name="i-lucide-image" class="size-3" />
            <span
              >{{ model.gallery.length }} image{{
                model.gallery.length !== 1 ? "s" : ""
              }}</span
            >
          </div>
          <div v-if="model.location" class="flex items-center gap-1">
            <UIcon name="i-lucide-map-pin" class="size-3" />
            <span>Location set</span>
          </div>
          <div v-if="model.cover_color" class="flex items-center gap-1">
            <span
              class="size-3 rounded-full inline-block border border-default"
              :style="{ background: model.cover_color as string }"
            />
            <span>{{ model.cover_color }}</span>
          </div>
        </div>
      </template>

      <!-- ─── side-bottom: quick links ──────────────────────────────────────── -->
      <template #side-bottom="{ model, isNew }">
        <div v-if="!isNew && model.status === 'published'" class="mt-3">
          <UButton
            variant="ghost"
            color="neutral"
            size="xs"
            leading-icon="i-lucide-external-link"
            class="w-full justify-start text-xs"
            :to="`/articles/${model.slug}`"
            target="_blank"
          >
            View live article
          </UButton>
        </div>
      </template>
    </MapoDetail>
  </div>
</template>
