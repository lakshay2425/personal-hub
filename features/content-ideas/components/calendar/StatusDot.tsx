import type { ContentIdeaStatus } from "../../types";

const DOT_STYLES: Record<ContentIdeaStatus, string> = {
  Draft: "bg-zinc-400 dark:bg-zinc-500",
  Ready: "bg-amber-500 dark:bg-amber-400",
  Published: "bg-emerald-500 dark:bg-emerald-400",
};

interface StatusDotProps {
  status: ContentIdeaStatus;
  className?: string;
}

export function StatusDot({ status, className = "" }: StatusDotProps) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${DOT_STYLES[status]} ${className}`}
      aria-hidden="true"
    />
  );
}
