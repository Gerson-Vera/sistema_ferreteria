'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface SidebarCtx {
  open: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarCtx>({ open: true, toggle: () => {} });

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const toggle = useCallback(() => setOpen(prev => !prev), []);
  return <SidebarContext.Provider value={{ open, toggle }}>{children}</SidebarContext.Provider>;
}

export const useSidebar = () => useContext(SidebarContext);
