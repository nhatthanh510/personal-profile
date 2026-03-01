import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore, type StoreApi } from "zustand";
import { createFinderStore, type FinderState } from "./finder";

const FinderStoreContext = createContext<StoreApi<FinderState> | null>(null);

export function FinderStoreProvider({
  children,
  windowId,
  initialPath,
}: {
  children: ReactNode;
  windowId: string;
  initialPath?: string[];
}) {
  const [store] = useState(() => createFinderStore(windowId, initialPath));
  return (
    <FinderStoreContext.Provider value={store}>
      {children}
    </FinderStoreContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFinderInstance<T>(selector: (state: FinderState) => T): T {
  const store = useContext(FinderStoreContext);
  if (!store) throw new Error("useFinderInstance must be used within FinderStoreProvider");
  return useStore(store, selector);
}
