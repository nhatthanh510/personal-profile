import { useState, useEffect, useMemo } from "react";
import WindowWrapper from "@/hoc/WindowWrapper";
import type { WindowWrapperProps } from "@/hoc/WindowWrapper";
import { WindowTitleBar } from "@/components/WindowTitleBar";
import { WindowShell } from "@/components/WindowShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import useWindowStore from "@/store/window";
import { isFileViewerData } from "@/constants";

const TextViewer = ({ titleBarRef }: WindowWrapperProps) => {
  const rawData = useWindowStore((s) => s.windows.txtFile.data);
  const data = isFileViewerData(rawData) ? rawData : null;

  const [fetched, setFetched] = useState<{ src: string; text: string | null; error: boolean }>({
    src: "",
    text: null,
    error: false,
  });

  const src = data?.src;
  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setFetched({ src, text, error: false });
      })
      .catch(() => {
        if (!cancelled) setFetched({ src, text: null, error: true });
      });
    return () => { cancelled = true; };
  }, [src]);

  const { text, loading, error } = useMemo(() => {
    if (!data) return { text: null, loading: false, error: false };
    if (fetched.src === data.src) {
      return { text: fetched.text, loading: false, error: fetched.error };
    }
    return { text: null, loading: true, error: false };
  }, [data, fetched]);

  if (!data) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <WindowShell className="bg-white">
        <WindowTitleBar target="txtFile" titleBarRef={titleBarRef}>
          <span className="text-[13px] text-[#333] font-medium truncate max-w-[300px]">
            {data.title}
          </span>
        </WindowTitleBar>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {error ? (
            <div className="flex items-center justify-center py-20">
              <span className="text-[13px] text-[#ff6b6b]">Failed to load file</span>
            </div>
          ) : loading || text === null ? (
            <div className="flex items-center justify-center py-20">
              <span className="text-[13px] text-[#999]">Loading…</span>
            </div>
          ) : (
            <div className="p-5 text-[13px] leading-relaxed text-[#333] font-sans space-y-4">
              {text.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i}>{paragraph.replace(/\n/g, " ")}</p>
              ))}
            </div>
          )}
        </div>
      </WindowShell>
    </TooltipProvider>
  );
};

const TextViewerWindow = WindowWrapper(TextViewer, "txtFile");
export { TextViewerWindow };
