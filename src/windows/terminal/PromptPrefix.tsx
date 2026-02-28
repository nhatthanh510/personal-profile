import { PROMPT, PROMPT_PATH } from "./terminalCommands";

export function PromptPrefix() {
  return (
    <span className="select-none">
      <span className="text-[#78dce8]">{PROMPT}</span>
      <span className="text-[#a9a9a9]">:</span>
      <span className="text-[#a6e22e]">{PROMPT_PATH}</span>
      <span className="text-[#a9a9a9]">$ </span>
    </span>
  );
}
