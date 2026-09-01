import type { ContentIdeaType } from "../../types";

const DOT_STYLES: Record<ContentIdeaType, string> = {
  Blog: "bg-purple-500 dark:bg-purple-400",
  Reel: "bg-pink-500 dark:bg-pink-400",
  Post: "bg-blue-500 dark:bg-blue-400",
  "YT Video": "bg-red-500 dark:bg-red-400",
  Other: "bg-zinc-400 dark:bg-zinc-500",
};

interface ContentTypeDotProps {
  contentType: ContentIdeaType;
  className?: string;
}

export function ContentTypeDot({
  contentType,
  className = "",
}: ContentTypeDotProps) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-sm ${DOT_STYLES[contentType]} ${className}`}
      title={contentType}
      aria-hidden="true"
    />
  );
}
