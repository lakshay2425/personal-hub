import type { PeoplePlatform } from "../types";

const PLATFORM_BADGE_CONFIG: Record<
  PeoplePlatform,
  { icon: string; className: string }
> = {
  LinkedIn: {
    icon: "in",
    className:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-800",
  },
  X: {
    icon: "X",
    className:
      "bg-black text-white ring-black dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-700",
  },
  Instagram: {
    icon: "IG",
    className:
      "bg-pink-50 text-pink-700 ring-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:ring-pink-800",
  },
  YouTube: {
    icon: "YT",
    className:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-800",
  },
  Other: {
    icon: "·",
    className:
      "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700",
  },
};

export function PeoplePlatformBadge({ platform }: { platform: PeoplePlatform }) {
  const config = PLATFORM_BADGE_CONFIG[platform];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      <span className="text-[10px] font-bold leading-none">{config.icon}</span>
      {platform}
    </span>
  );
}
