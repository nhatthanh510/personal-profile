import { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import WindowWrapper from "@/hoc/WindowWrapper";
import type { WindowWrapperProps } from "@/hoc/WindowWrapper";
import { WindowControls } from "@/components/WindowControls";
import { WindowShell } from "@/components/WindowShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import useWindowStore from "@/store/window";
import { useIsCompact } from "@/hooks/use-mobile";
import { isFileViewerData } from "@/constants";
import { ChevronLeft, Download } from "lucide-react";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// Render at a fixed high resolution once. CSS scales to fit container.
// This avoids re-rendering pages (and the blank flash) on resize/maximize.
const RENDER_WIDTH = 1200;

/** Returns true after `delay` ms once `isOpen` becomes true; resets to false when closed. */
function useDelayedOpen(isOpen: boolean, delay: number) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!isOpen) {
      setReady(false); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    const id = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(id);
  }, [isOpen, delay]);
  return ready;
}

const PDFViewer = ({ titleBarRef }: WindowWrapperProps) => {
  const isCompact = useIsCompact();
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const rawData = useWindowStore((s) => s.windows.pdfFile.data);
  const data = isFileViewerData(rawData) ? rawData : null;
  const isOpen = useWindowStore((s) => s.windows.pdfFile.isOpen);

  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Delay rendering until window is visible (animation sets display:block)
  const ready = useDelayedOpen(isOpen, 60);

  // Set a CSS variable with the scale ratio so text/annotation layers
  // can be scaled via CSS transform — no React re-render on resize.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isOpen) return;

    const updateScale = () => {
      const ratio = el.clientWidth / RENDER_WIDTH;
      el.style.setProperty("--pdf-scale", String(ratio));
    };

    const timer = setTimeout(updateScale, 60);
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [isOpen]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
    },
    []
  );

  // Track current page based on scroll position
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || numPages === 0) return;

    const pages = el.querySelectorAll<HTMLElement>(".react-pdf__Page");
    if (pages.length === 0) return;

    const scrollMid = el.scrollTop + el.clientHeight / 2;
    let page = 1;
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].offsetTop + pages[i].offsetHeight / 2 <= scrollMid) {
        page = i + 1;
      }
    }
    setCurrentPage(page);
  }, [numPages]);

  const handleDownload = useCallback(() => {
    if (!data) return;
    const link = document.createElement("a");
    link.href = data.src;
    link.download = data.title;
    link.click();
  }, [data]);

  if (!data) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <WindowShell className="bg-[rgba(22,24,35,0.65)] backdrop-blur-[20px]">
        {/* Title bar */}
        <div
          ref={titleBarRef}
          className={cn(
            "flex items-center h-12 bg-white/[0.06] border-b border-white/[0.06] px-3 gap-2 select-none shrink-0",
            !isCompact && "cursor-grab active:cursor-grabbing"
          )}
        >
          {isCompact ? (
            <button
              type="button"
              className="flex items-center gap-0.5 text-[#007AFF] text-sm font-normal shrink-0"
              onClick={() => closeWindow("pdfFile")}
            >
              <ChevronLeft className="size-5" strokeWidth={2.5} />
              <span>Go Back</span>
            </button>
          ) : (
            <WindowControls target="pdfFile" />
          )}
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[13px] text-white/90 font-medium truncate max-w-[300px]">
              {data.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {numPages > 0 && (
              <span className="text-[11px] text-white/40">
                {currentPage} / {numPages}
              </span>
            )}
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 rounded hover:bg-white/[0.1] text-white/50 hover:text-white/80 transition-colors"
              title="Download"
            >
              <Download className="size-4" />
            </button>
          </div>
        </div>

        {/* PDF pages — rendered at fixed width, CSS-scaled to fit */}
        <div
          ref={scrollRef}
          className="pdf-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
          onScroll={handleScroll}
        >
          <Document
            file={data.src}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center py-20">
                <span className="text-[13px] text-[#999]">Loading PDF…</span>
              </div>
            }
            error={
              <div className="flex items-center justify-center py-20">
                <span className="text-[13px] text-[#ff6b6b]">
                  Failed to load PDF
                </span>
              </div>
            }
          >
            {ready &&
              Array.from({ length: numPages }, (_, i) => (
                <Page
                  key={i + 1}
                  pageNumber={i + 1}
                  width={RENDER_WIDTH}
                  renderTextLayer
                  renderAnnotationLayer
                />
              ))}
          </Document>
        </div>
      </WindowShell>
    </TooltipProvider>
  );
};

const PDFViewerWindow = WindowWrapper(PDFViewer, "pdfFile");
export { PDFViewerWindow };
