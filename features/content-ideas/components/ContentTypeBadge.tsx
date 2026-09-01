import type { ContentIdeaType } from "../types";

const TYPE_STYLES: Record<ContentIdeaType, string> = {
  Blog: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Reel: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  Post: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "YT Video":
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Other: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

interface ContentTypeBadgeProps {
  contentType: ContentIdeaType;
}

export function ContentTypeBadge({ contentType }: ContentTypeBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[contentType]}`}
    >
      {contentType}
    </span>
  );
}
