"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { ChannelBadge } from "./ChannelBadge";
import { DEFAULT_RESPONSE_STATUS } from "../constants";
import { formatDate } from "../lib/dateUtils";
import { getTouchpointInlineActions } from "../lib/touchpointInlineActions";
import type { LeadTouchpoint, Template } from "../types";
import { StatusBadge } from "./StatusBadge";
import { CompanyOverflowMenu } from "./CompanyOverflowMenu";

interface LeadTouchpointRowProps {
  touchpoint: LeadTouchpoint;
  templateMap: Map<number, Template>;
  onEdit: () => void;
  onDelete: () => void;
  onQuickAction: (touchpoint: LeadTouchpoint, responseStatus: string) => Promise<void>;
}

export function LeadTouchpointRow({
  touchpoint,
  templateMap,
  onEdit,
  onDelete,
  onQuickAction,
}: LeadTouchpointRowProps) {
  const templateTitle =
    touchpoint.templateId != null
      ? templateMap.get(touchpoint.templateId)?.title
      : null;
  const inlineActions = getTouchpointInlineActions(touchpoint);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const handleQuickAction = async (actionId: string, responseStatus: string) => {
    if (pendingActionId) return;

    setPendingActionId(actionId);
    try {
      await onQuickAction(touchpoint, responseStatus);
      toast.success(
        responseStatus === "Accepted"
          ? "Connection request accepted"
          : "Touchpoint marked as replied",
      );
    } catch {
      toast.error("Failed to update touchpoint");
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <ChannelBadge channel={touchpoint.channel} />
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {touchpoint.type}
        </span>
        <StatusBadge status={touchpoint.status} />
        <StatusBadge
          status={touchpoint.responseStatus || DEFAULT_RESPONSE_STATUS}
        />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {formatDate(touchpoint.occurredAt)}
        </span>
      </div>

      {templateTitle ? (
        <div className="mb-2 text-sm text-zinc-700 dark:text-zinc-300">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Template: {" "}
          </span>
          {templateTitle}
        </div>
      ) : null}

      {touchpoint.context ? (
        <p className="mb-3 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
          {touchpoint.context}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {inlineActions.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={Boolean(pendingActionId)}
            onClick={() => void handleQuickAction(action.id, action.responseStatus)}
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {pendingActionId === action.id ? "Saving..." : action.label}
          </button>
        ))}
        <CompanyOverflowMenu
          label="Touchpoint options"
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
