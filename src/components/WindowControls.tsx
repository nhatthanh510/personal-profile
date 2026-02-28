import { Minus, Square, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useWindowStore from "@/store/window";

interface WindowControlsProps {
  target: string;
}

function TrafficLightButton({
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
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`group size-3 rounded-full flex-center transition-all hover:brightness-90 ${color}`}
          aria-label={label}
        >
          <Icon
            className={`size-2 opacity-0 group-hover:opacity-100 transition-opacity ${iconColor}`}
            strokeWidth={3}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-[#3a3a3a] text-[#e0e0e0] text-[11px] border-[#555] px-2 py-1"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function WindowControls({ target }: WindowControlsProps) {
  const { closeWindow, minimizeWindow, toggleMaximize } = useWindowStore();

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
        hoverIcon={Square}
        iconColor="text-[#0a5417]"
        label="Full Screen"
        onClick={() => toggleMaximize(target)}
      />
    </div>
  );
}
