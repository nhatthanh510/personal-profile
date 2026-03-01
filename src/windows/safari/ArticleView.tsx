import { useRef, memo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronLeft, Calendar, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Article } from "./articlesData";

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
}

export const ArticleView = memo(function ArticleView({ article, onBack }: ArticleViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      gsap.fromTo(
        containerRef.current,
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          ease: "power2.out",
        }
      );
    },
    { scope: containerRef }
  );

  const paragraphs = article.content
    .split("\n\n")
    .filter((p) => p.trim().length > 0);

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <ScrollArea className="flex-1 min-h-0">
        {/* Hero image */}
        <div className="relative w-full aspect-[21/9] overflow-hidden bg-white/[0.03]">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Article body */}
        <div className="max-w-[640px] mx-auto px-6 py-5">
          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-[13px] text-[#06b6d4] hover:text-[#22d3ee] transition-colors mb-4 -ml-1"
          >
            <ChevronLeft className="size-4" />
            <span>All Articles</span>
          </button>

          {/* Title */}
          <h1 className="text-[22px] font-bold text-white/90 leading-tight mb-3">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-[12px] text-white/40 mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {article.readTime}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium text-[#06b6d4] bg-[#06b6d4]/10 rounded-full px-2.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.08] mb-5" />

          {/* Content */}
          <div className="space-y-4 pb-6">
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className="text-[14px] text-white/60 leading-[1.7] tracking-[-0.003em]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
});
