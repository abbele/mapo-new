<script setup lang="ts">
definePageMeta({
  layout: "mapo-default",
  label: "Articles",
  icon: "i-lucide-newspaper",
  middleware: ["auth"],
});

interface Article {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  reading_time: number;
  created_at: string;
  updated_at: string;
}

const {
  data: articles,
  refresh,
  status,
} = await useFetch<Article[]>("/api/articles");

const STATUS_COLOR: Record<string, "success" | "warning" | "neutral"> = {
  published: "success",
  draft: "warning",
  archived: "neutral",
};
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-highlighted">Articles</h1>
      <UButton leading-icon="i-lucide-plus" to="/form/article/new">
        New Article
      </UButton>
    </div>

    <UCard>
      <div
        v-if="status === 'pending'"
        class="flex items-center justify-center py-12"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-6 text-muted animate-spin"
        />
      </div>

      <div
        v-else-if="!articles?.length"
        class="flex flex-col items-center justify-center py-12 text-muted space-y-3"
      >
        <UIcon name="i-lucide-newspaper" class="size-12 opacity-30" />
        <p class="text-sm">No articles yet.</p>
        <UButton variant="outline" to="/form/article/new" size="sm">
          Create the first article
        </UButton>
      </div>

      <div v-else class="divide-y divide-default">
        <div
          v-for="article in articles"
          :key="article.id"
          class="flex items-center justify-between py-3 px-1 hover:bg-elevated/50 rounded transition-colors"
        >
          <div class="flex items-start gap-3 min-w-0">
            <div class="mt-0.5">
              <UIcon
                v-if="article.featured"
                name="i-lucide-star"
                class="size-4 text-warning"
              />
              <UIcon
                v-else
                name="i-lucide-file-text"
                class="size-4 text-muted"
              />
            </div>
            <div class="min-w-0">
              <p class="font-medium text-highlighted truncate">
                {{ article.title }}
              </p>
              <p class="text-xs text-muted font-mono mt-0.5">
                /articles/{{ article.slug }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3 shrink-0 ml-4">
            <UBadge
              :color="STATUS_COLOR[article.status] ?? 'neutral'"
              variant="subtle"
              size="xs"
            >
              {{ article.status }}
            </UBadge>
            <span class="text-xs text-muted hidden sm:block">
              {{ article.reading_time }}m
            </span>
            <UButton
              :to="`/form/article/${article.id}`"
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-lucide-pencil"
            />
          </div>
        </div>
      </div>
    </UCard>

    <div class="flex justify-end">
      <UButton
        variant="ghost"
        color="neutral"
        size="xs"
        leading-icon="i-lucide-refresh-cw"
        @click="refresh()"
      >
        Refresh
      </UButton>
    </div>
  </div>
</template>
