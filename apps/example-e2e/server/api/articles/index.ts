import { getArticles, createArticle } from "../../utils/articleDb";

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === "GET") {
    const query = getQuery(event);
    const search = query.search as string | undefined;
    return getArticles(search);
  }

  if (method === "POST") {
    const body = await readBody(event);
    if (!body?.title) {
      throw createError({
        statusCode: 400,
        data: { title: ["This field is required."] },
      });
    }
    return createArticle({
      title: body.title ?? "",
      slug:
        body.slug ??
        body.title
          ?.toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") ??
        "",
      excerpt: body.excerpt ?? "",
      body: body.body ?? "",
      cover_color: body.cover_color ?? "#3b82f6",
      seo: body.seo ?? { title: "", description: "" },
      category: body.category ?? null,
      tags: body.tags ?? [],
      status: body.status ?? "draft",
      featured: body.featured ?? false,
      allow_comments: body.allow_comments ?? true,
      reading_time: body.reading_time ?? 5,
      location: body.location ?? null,
      gallery: body.gallery ?? [],
      author: body.author ?? { name: "", bio: "", avatar: "" },
      priority: body.priority ?? 0,
      published_at: body.published_at ?? null,
      translations: body.translations ?? {},
    });
  }

  throw createError({ statusCode: 405, message: "Method not allowed" });
});
