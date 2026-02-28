import { memo } from "react";
import { Maximize2, Minus, X, Minimize2 } from "lucide-react";
import useWindowStore from "@/store/window";
import { useShallow } from "zustand/react/shallow";
import type { WindowKey } from "@/constants";

interface WindowControlsProps {
  target: WindowKey;
}

const TrafficLightButton = memo(({
  color,
  hoverIcon: Icon,
  iconColor,
  label,
  onClick,
}: {
  color: string;
  hoverIcon: typeof X;
  iconColor: string;
  label: string;
  onClick?: () => void;
}) => (
    <button
      type="button"
      onClick={onClick}
      className={`group size-3 rounded-full flex-center transition-all hover:brightness-90 ${color}`}
      aria-label={label}
    >
      <Icon
        className={`size-2 opacity-0 group-hover:opacity-100 transition-opacity ${iconColor}`}
        strokeWidth={3}
      />
    </button>
));

export const WindowControls = ({ target }: WindowControlsProps) => {
  const { isMaximized, closeWindow, minimizeWindow, toggleMaximize } = useWindowStore(
    useShallow((s) => ({
      isMaximized: s.windows[target]?.isMaximized,
      closeWindow: s.closeWindow,
      minimizeWindow: s.minimizeWindow,
      toggleMaximize: s.toggleMaximize,
    }))
  );

  return (
    <div className="flex items-center gap-[7px] cursor-default">
      <TrafficLightButton
        color="bg-[#ff5f57]"
        hoverIcon={X}
        iconColor="text-[#4a0002]"
        label="Close"
        onClick={() => closeWindow(target)}
      />
      <TrafficLightButton
        color="bg-[#febc2e]"
        hoverIcon={Minus}
        iconColor="text-[#5a3e00]"
        label="Minimize"
        onClick={() => minimizeWindow(target)}
      />
      <TrafficLightButton
        color="bg-[#28c840]"
        hoverIcon={isMaximized ? Minimize2 : Maximize2}
        iconColor="text-[#0a5417]"
        label={isMaximized ? "Exit Full Screen" : "Full Screen"}
        onClick={() => toggleMaximize(target)}
      />
    </div>
  );
};
