"use client";

import toast from "react-hot-toast";

import { ProductOutreachChannelBadge } from "./ProductOutreachChannelBadge";
import { formatDate } from "../lib/dateUtils";
import {
  formatHandleDisplay,
  getInteractionUrl,
} from "../lib/productOutreachUtils";
import type { ProductOutreachInteraction } from "../types";
import { mobileActionClass } from "./MobileListCard";

interface ProductOutreachInteractionRowProps {
  interaction: ProductOutreachInteraction;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductOutreachInteractionRow({
  interaction,
  onEdit,
  onDelete,
}: ProductOutreachInteractionRowProps) {
  const profileUrl = getInteractionUrl(interaction.channel, interaction.handle);
  const handleDisplay = formatHandleDisplay(
    interaction.channel,
    interaction.handle,
  );

  const handleCopyContext = async () => {
    try {
      await navigator.clipboard.writeText(interaction.context);
      toast.success("Context copied to clipboard");
    } catch {
      toast.error("Failed to copy context");
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <ProductOutreachChannelBadge channel={interaction.channel} />
        {profileUrl ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            {handleDisplay}
          </a>
        ) : (
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {handleDisplay}
          </span>
        )}
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {formatDate(interaction.createdAt)}
        </span>
      </div>

      <p className="mb-3 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
        {interaction.context}
      </p>

      <div className="flex flex-wrap gap-2">
        {profileUrl ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={mobileActionClass.edit}
          >
            Link
          </a>
        ) : null}
        <button
          type="button"
          onClick={handleCopyContext}
          className={mobileActionClass.edit}
        >
          Copy context
        </button>
        <button
          type="button"
          onClick={onEdit}
          className={mobileActionClass.edit}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className={mobileActionClass.delete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
