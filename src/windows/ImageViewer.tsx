import WindowWrapper from "@/hoc/WindowWrapper";
import type { WindowWrapperProps } from "@/hoc/WindowWrapper";
import { WindowTitleBar } from "@/components/WindowTitleBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import useWindowStore from "@/store/window";

const ImageViewer = ({ titleBarRef }: WindowWrapperProps) => {
  const { windows } = useWindowStore();
  const data = windows.imgFile.data as { title: string; src: string } | null;

  if (!data) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl shadow-black/30 border border-[#c0c0c0] flex flex-col bg-[#1e1e1e]">
        <WindowTitleBar
          target="imgFile"
          titleBarRef={titleBarRef}
          className="bg-[#2d2d2d] border-b-[#1a1a1a]"
        >
          <span className="text-[13px] text-[#ccc] font-medium truncate max-w-[300px]">
            {data.title}
          </span>
        </WindowTitleBar>

        <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center bg-[#1e1e1e] p-4">
          <img
            src={data.src}
            alt={data.title}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

const ImageViewerWindow = WindowWrapper(ImageViewer, "imgFile");
export { ImageViewerWindow };
