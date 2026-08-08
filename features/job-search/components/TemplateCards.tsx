"use client";

import type { Template, TemplateType } from "../types";
import { StatusBadge } from "./StatusBadge";
import { TemplateBodyPreview } from "./TemplateBodyPreview";
import { mobileActionClass } from "./MobileListCard";

function getTemplateTypeVariant(
  type: TemplateType,
): "default" | "success" | "warning" | "danger" | "info" {
  switch (type) {
    case "Cold Email":
      return "info";
    case "LinkedIn Message":
      return "success";
    case "X DM":
      return "default";
    case "Follow-up":
      return "warning";
    default:
      return "default";
  }
}

interface TemplateCardsProps {
  templates: Template[];
  onCopy: (template: Template) => void;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
}

export function TemplateCards({
  templates,
  onCopy,
  onEdit,
  onDelete,
}: TemplateCardsProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {templates.map((template) => (
        <li
          key={template.id}
          className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 flex-1 break-words text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {template.title}
            </h3>
            <StatusBadge
              status={template.type}
              variant={getTemplateTypeVariant(template.type)}
            />
          </div>

          <div className="mt-3 flex-1">
            <TemplateBodyPreview body={template.body} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => onCopy(template)}
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() => onEdit(template)}
              className={mobileActionClass.edit}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(template)}
              className={mobileActionClass.delete}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
