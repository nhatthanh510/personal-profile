import { useState, useEffect, useCallback } from "react";
import { fetchArticlesFromDevToMultiple, type Article } from "./articlesData";

interface UseArticlesResult {
  articles: Article[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useArticles(): UseArticlesResult {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchArticlesFromDevToMultiple();
      setArticles(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load articles");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { articles, loading, error, retry: load };
}
