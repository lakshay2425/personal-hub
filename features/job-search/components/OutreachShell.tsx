"use client";

import type { ReactNode } from "react";

import { OutreachTabNav } from "./OutreachTabNav";

export function OutreachShell({ children }: { children: ReactNode }) {
  return (
    <>
      <OutreachTabNav />
      {children}
    </>
  );
}
