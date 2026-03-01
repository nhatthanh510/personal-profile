// ── Dev.to API response (subset we use) ─────────────────────────────
interface DevToArticleResponse {
  id: number;
  title: string;
  description: string;
  url: string;
  canonical_url: string;
  cover_image: string | null;
  tag_list: string[];
  readable_publish_date: string;
  positive_reactions_count: number;
}

const DEVTO_API = "https://dev.to/api/articles";
const DEFAULT_TAG = "react";
const FALLBACK_THUMBNAIL = "/images/blog2.png";

// ── Article type (supports both fetched and static) ─────────────────
export interface Article {
  id: string;
  title: string;
  excerpt: string;
  thumbnail: string;
  date: string;
  readTime: string;
  tags: string[];
  content: string;
  url: string;
  /** When set, article is from an external source; show excerpt + link */
  sourceName?: string;
  sourceUrl?: string;
}

function stripHtml(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, "").trim();
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent?.trim() ?? html.replace(/<[^>]*>/g, "").trim();
}

function mapDevToToArticle(item: DevToArticleResponse): Article {
  const excerpt = stripHtml(item.description || "").slice(0, 300);
  return {
    id: `devto-${item.id}`,
    title: item.title,
    excerpt: excerpt + (excerpt.length >= 300 ? "…" : ""),
    thumbnail: item.cover_image ?? FALLBACK_THUMBNAIL,
    date: item.readable_publish_date,
    readTime: "—",
    tags: (item.tag_list ?? []).slice(0, 5).map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
    content: "",
    url: `articles.portfolio.dev/${item.id}`,
    sourceName: "Dev.to",
    sourceUrl: item.url,
  };
}

/**
 * Fetch articles from Dev.to by tag (public API, CORS-friendly).
 * Use tags like "react", "typescript", "javascript", "webdev".
 */
export async function fetchArticlesFromDevTo(tag: string = DEFAULT_TAG): Promise<Article[]> {
  const res = await fetch(
    `${DEVTO_API}?tag=${encodeURIComponent(tag)}&per_page=9`
  );
  if (!res.ok) throw new Error("Failed to fetch articles");
  const data: DevToArticleResponse[] = await res.json();
  return data.map(mapDevToToArticle);
}

/**
 * Fetch articles from multiple Dev.to tags and merge (dedupe by id).
 */
export async function fetchArticlesFromDevToMultiple(
  tags: string[] = ["react", "typescript", "javascript"]
): Promise<Article[]> {
  const results = await Promise.allSettled(tags.map((t) => fetchArticlesFromDevTo(t)));
  const byId = new Map<string, Article>();
  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const a of result.value) {
        if (!byId.has(a.id)) byId.set(a.id, a);
      }
    }
  }
  return Array.from(byId.values()).slice(0, 9);
}
