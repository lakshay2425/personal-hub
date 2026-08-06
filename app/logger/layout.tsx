import type { Metadata } from "next";

import { LoggerShell } from "@/features/logger/components/LoggerShell";

export const metadata: Metadata = {
  title: "Logger",
};

export default function LoggerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LoggerShell>{children}</LoggerShell>;
}
