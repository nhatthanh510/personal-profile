import { useMemo } from "react";
import useWindowStore from "@/store/window";
import { Finder } from "@/windows/Finder";

export function FinderManager() {
  const windows = useWindowStore((s) => s.windows);

  const finderIds = useMemo(
    () => Object.keys(windows).filter((k) => k.startsWith("finder-")),
    [windows]
  );

  return (
    <>
      {finderIds.map((id) => (
        <Finder key={id} instanceId={id} />
      ))}
    </>
  );
}
