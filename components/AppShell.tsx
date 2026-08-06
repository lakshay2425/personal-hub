"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { AppSidebar } from "./AppSidebar";

const FULL_WIDTH_ROUTES = ["/", "/~offline"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !FULL_WIDTH_ROUTES.includes(pathname);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        className={`flex min-w-0 flex-1 flex-col ${sidebarOpen ? "lg:pt-0" : "pt-14"}`}
      >
        {children}
      </div>
    </div>
  );
}
