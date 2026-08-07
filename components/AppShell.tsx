"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { AppSidebar } from "./AppSidebar";
import { SidebarProvider } from "./SidebarContext";

const FULL_WIDTH_ROUTES = ["/", "/~offline"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !FULL_WIDTH_ROUTES.includes(pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const syncSidebar = () => {
      setSidebarOpen(mediaQuery.matches);
    };

    syncSidebar();
    mediaQuery.addEventListener("change", syncSidebar);
    return () => mediaQuery.removeEventListener("change", syncSidebar);
  }, []);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-full flex-1">
      <AppSidebar
        isOpen={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
      />
      <div
        className={`flex min-w-0 flex-1 flex-col ${sidebarOpen ? "" : "max-lg:pt-14"}`}
      >
        <SidebarProvider isOpen={sidebarOpen}>{children}</SidebarProvider>
      </div>
    </div>
  );
}
