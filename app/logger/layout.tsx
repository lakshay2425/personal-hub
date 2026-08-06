import type { Metadata } from "next";

import { LoggerShell } from "@/features/logger/components/LoggerShell";

export const metadata: Metadata = {
  title: "Logger",
  description:
    "Log what you did as separate entries — multiple times per day, stored locally.",
};

export default function LoggerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LoggerShell>{children}</LoggerShell>;
}
