"use client";

import toast from "react-hot-toast";
import { Copy } from "lucide-react";

interface LeadEmailButtonProps {
  email: string;
}

export function LeadEmailButton({ email }: LeadEmailButtonProps) {
  const trimmed = email.trim();

  if (!trimmed) {
    return <span className="text-zinc-400">—</span>;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trimmed);
      toast.success("Email copied to clipboard");
    } catch {
      toast.error("Failed to copy email");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy email to clipboard"
      aria-label={`Copy email ${trimmed}`}
      className="inline-flex max-w-full items-center gap-1.5 truncate text-left text-zinc-700 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-zinc-50"
    >
      <span className="truncate">{trimmed}</span>
      <Copy aria-hidden="true" size={14} className="shrink-0" />
    </button>
  );
}
