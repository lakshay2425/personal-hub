"use client";

import { createContext, useContext, type ReactNode } from "react";

interface SidebarContextValue {
  isOpen: boolean;
}

const SidebarContext = createContext<SidebarContextValue>({ isOpen: false });

export function SidebarProvider({
  isOpen,
  children,
}: SidebarContextValue & { children: ReactNode }) {
  return (
    <SidebarContext.Provider value={{ isOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
