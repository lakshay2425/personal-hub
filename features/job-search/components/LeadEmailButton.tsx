"use client";

import toast from "react-hot-toast";

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
      className="max-w-full truncate text-left text-zinc-700 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-zinc-50"
    >
      {trimmed}
    </button>
  );
}
