// In-memory database for the article editor E2E example.
// All data is reset on server restart.

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface ArticleSeo {
  title: string;
  description: string;
}

export interface ArticleLocation {
  lat: number;
  lng: number;
}

export interface ArticleGalleryItem {
  caption: string;
  url: string;
  alt: string;
}

export interface ArticleAuthor {
  name: string;
  bio: string;
  avatar: string;
}

export interface Article {
  id: number;
  // Content tab
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_color: string;
  // SEO tab
  seo: ArticleSeo;
  // Settings tab
  category: number | null;
  tags: number[];
  status: "draft" | "published" | "archived";
  featured: boolean;
  allow_comments: boolean;
  reading_time: number;
  // Advanced tab
  location: ArticleLocation | null;
  gallery: ArticleGalleryItem[];
  author: ArticleAuthor;
  priority: number;
  // Metadata
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Translations
  translations?: Record<
    string,
    { title: string; excerpt: string; body: string }
  >;
}

const categories: Category[] = [
  { id: 1, name: "Technology", slug: "technology" },
  { id: 2, name: "Design", slug: "design" },
  { id: 3, name: "Business", slug: "business" },
  { id: 4, name: "Culture", slug: "culture" },
  { id: 5, name: "Science", slug: "science" },
];

const tags: Tag[] = [
  { id: 1, name: "Vue.js", color: "#42b883" },
  { id: 2, name: "Nuxt", color: "#00dc82" },
  { id: 3, name: "TypeScript", color: "#3178c6" },
  { id: 4, name: "Open Source", color: "#f97316" },
  { id: 5, name: "Tutorial", color: "#8b5cf6" },
  { id: 6, name: "Performance", color: "#ec4899" },
  { id: 7, name: "UX", color: "#14b8a6" },
  { id: 8, name: "AI", color: "#f59e0b" },
];

const articles: Article[] = [
  {
    id: 1,
    title: "Building Admin UIs with Mapo v2",
    slug: "building-admin-uis-mapo-v2",
    excerpt:
      "A deep dive into the new Mapo v2 form engine and how it simplifies complex admin interfaces.",
    body: "<p>Mapo v2 is a complete rewrite of the popular Mapo admin framework...</p>",
    cover_color: "#3b82f6",
    seo: {
      title: "Building Admin UIs with Mapo v2 | Mapo Blog",
      description:
        "Learn how to build complex admin interfaces using Mapo v2's declarative form engine.",
    },
    category: 1,
    tags: [1, 2, 3],
    status: "published",
    featured: true,
    allow_comments: true,
    reading_time: 8,
    location: { lat: 45.4654, lng: 9.1866 },
    gallery: [
      {
        caption: "MapoForm in action",
        url: "https://placehold.co/800x400",
        alt: "Screenshot of MapoForm",
      },
      {
        caption: "Sidebar layout",
        url: "https://placehold.co/800x400",
        alt: "Screenshot of sidebar",
      },
    ],
    author: {
      name: "Mapo Team",
      bio: "The Mapo core team.",
      avatar: "https://placehold.co/100x100",
    },
    priority: 10,
    published_at: "2025-03-15T10:00:00Z",
    created_at: "2025-03-10T09:00:00Z",
    updated_at: "2025-03-15T10:00:00Z",
    translations: {
      it: {
        title: "Creare UI Admin con Mapo v2",
        excerpt: "Un'analisi approfondita del nuovo motore form di Mapo v2.",
        body: "<p>Mapo v2 è una riscrittura completa del popolare framework admin Mapo...</p>",
      },
      en: {
        title: "Building Admin UIs with Mapo v2",
        excerpt: "A deep dive into the new Mapo v2 form engine.",
        body: "<p>Mapo v2 is a complete rewrite of the popular Mapo admin framework...</p>",
      },
    },
  },
  {
    id: 2,
    title: "Performance Patterns in Vue 3",
    slug: "performance-patterns-vue3",
    excerpt: "Practical patterns for building fast Vue 3 applications.",
    body: "<p>Vue 3's Composition API opens up new optimization paths...</p>",
    cover_color: "#10b981",
    seo: {
      title: "Performance Patterns in Vue 3",
      description:
        "Practical patterns for building fast Vue 3 applications with the Composition API.",
    },
    category: 1,
    tags: [1, 6],
    status: "draft",
    featured: false,
    allow_comments: true,
    reading_time: 12,
    location: null,
    gallery: [],
    author: {
      name: "Jane Smith",
      bio: "Frontend engineer and Vue.js contributor.",
      avatar: "https://placehold.co/100x100",
    },
    priority: 5,
    published_at: null,
    created_at: "2025-04-01T08:00:00Z",
    updated_at: "2025-04-01T08:00:00Z",
  },
];

let nextId = 3;

export function getArticles(search?: string): Article[] {
  if (!search) return articles;
  const q = search.toLowerCase();
  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q),
  );
}

export function getArticle(id: number): Article | undefined {
  return articles.find((a) => a.id === id);
}

export function createArticle(
  data: Omit<Article, "id" | "created_at" | "updated_at">,
): Article {
  const now = new Date().toISOString();
  const article: Article = {
    ...data,
    id: nextId++,
    created_at: now,
    updated_at: now,
  } as Article;
  articles.push(article);
  return article;
}

export function updateArticle(
  id: number,
  patch: Partial<Article>,
): Article | null {
  const idx = articles.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const updated = {
    ...articles[idx],
    ...patch,
    id,
    updated_at: new Date().toISOString(),
  };
  articles[idx] = updated;
  return updated;
}

export function deleteArticle(id: number): boolean {
  const idx = articles.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  articles.splice(idx, 1);
  return true;
}

export function getCategories(search?: string): Category[] {
  if (!search) return categories;
  const q = search.toLowerCase();
  return categories.filter((c) => c.name.toLowerCase().includes(q));
}

export function getTags(search?: string): Tag[] {
  if (!search) return tags;
  const q = search.toLowerCase();
  return tags.filter((t) => t.name.toLowerCase().includes(q));
}
