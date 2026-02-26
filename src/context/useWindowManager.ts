import { useContext } from 'react';
import { WindowManagerContext, type WindowManagerContextType } from './windowManagerState';

export const useWindowManager = (): WindowManagerContextType => {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error('useWindowManager must be used within WindowManagerProvider');
  return ctx;
};
