import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Clock, Calendar } from "lucide-react";
import type { Article } from "./articlesData";

interface ArticleListProps {
  articles: Article[];
  onSelect: (article: Article) => void;
}

export function ArticleList({ articles, onSelect }: ArticleListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = containerRef.current?.querySelectorAll(".article-card");
      if (!cards?.length) return;

      gsap.fromTo(
        cards,
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 gap-4 p-5"
    >
      {articles.map((article) => (
        <button
          key={article.id}
          type="button"
          className="article-card group text-left rounded-lg border border-[#e5e5e5] bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-[#d0d0d0] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40"
          onClick={() => onSelect(article)}
        >
          <div className="aspect-[16/9] overflow-hidden bg-[#f5f5f7]">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              draggable={false}
            />
          </div>

          <div className="p-3.5">
            <div className="flex items-center gap-3 text-[11px] text-[#86868b] mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {article.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {article.readTime}
              </span>
            </div>

            <h3 className="text-[13px] font-semibold text-[#1d1d1f] leading-snug mb-1.5 line-clamp-2 group-hover:text-[#0071e3] transition-colors">
              {article.title}
            </h3>

            <p className="text-[12px] text-[#6e6e73] leading-relaxed line-clamp-2 mb-3">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium text-[#0071e3] bg-[#0071e3]/8 rounded-full px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
