"use client";

import { ChannelBadge } from "./ChannelBadge";
import { formatDate } from "../lib/dateUtils";
import { getTemplateTitle } from "../lib/templateUtils";
import type { LeadTouchpoint, Template } from "../types";
import { StatusBadge } from "./StatusBadge";
import { mobileActionClass } from "./MobileListCard";

interface LeadTouchpointRowProps {
  touchpoint: LeadTouchpoint;
  templateMap: Map<number, Template>;
  onEdit: () => void;
  onDelete: () => void;
}

export function LeadTouchpointRow({
  touchpoint,
  templateMap,
  onEdit,
  onDelete,
}: LeadTouchpointRowProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <ChannelBadge channel={touchpoint.channel} />
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {touchpoint.type}
        </span>
        <StatusBadge status={touchpoint.status} />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {formatDate(touchpoint.occurredAt)}
        </span>
      </div>

      <div className="mb-2 text-sm text-zinc-700 dark:text-zinc-300">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Template:{" "}
        </span>
        {getTemplateTitle(templateMap, touchpoint.templateId)}
      </div>

      {touchpoint.context ? (
        <p className="mb-3 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
          {touchpoint.context}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
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
