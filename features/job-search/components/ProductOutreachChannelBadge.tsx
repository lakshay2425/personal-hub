import type { ProductOutreachChannel } from "../types";

const CHANNEL_BADGE_CONFIG: Record<
  ProductOutreachChannel,
  { icon: string; className: string }
> = {
  Instagram: {
    icon: "IG",
    className:
      "bg-pink-50 text-pink-700 ring-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:ring-pink-800",
  },
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
  Email: {
    icon: "@",
    className:
      "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700",
  },
};

export function ProductOutreachChannelBadge({
  channel,
}: {
  channel: ProductOutreachChannel;
}) {
  const config = CHANNEL_BADGE_CONFIG[channel];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      <span className="text-[10px] font-bold leading-none">{config.icon}</span>
      {channel}
    </span>
  );
}
