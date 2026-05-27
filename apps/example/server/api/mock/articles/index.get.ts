import { articles } from "./_store";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const search = String(query.search ?? "").toLowerCase();
  const status = query.status ? String(query.status) : null;
  const page = Math.max(1, Number(query.page ?? 1));
  const pageSize = Math.max(1, Math.min(100, Number(query.page_size ?? 20)));
  const ordering = String(query.ordering ?? "-published_at");

  let results = [...articles.values()];

  if (search) {
    results = results.filter(
      (a) =>
        a.title.toLowerCase().includes(search) ||
        a.slug.toLowerCase().includes(search),
    );
  }

  if (status) {
    results = results.filter((a) => a.status === status);
  }

  const desc = ordering.startsWith("-");
  const field = ordering.replace(/^-/, "") as keyof (typeof results)[0];
  results.sort((a, b) => {
    const av = a[field] ?? "";
    const bv = b[field] ?? "";
    return desc ? (av < bv ? 1 : -1) : av > bv ? 1 : -1;
  });

  const count = results.length;
  const start = (page - 1) * pageSize;
  results = results.slice(start, start + pageSize);

  return { count, results };
});
