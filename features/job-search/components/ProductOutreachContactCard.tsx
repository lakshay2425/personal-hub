"use client";

import { getContactDisplayTitle } from "../lib/productOutreachUtils";
import type { ProductOutreachContactWithInteractions } from "../types";
import { mobileActionClass } from "./MobileListCard";
import { ProductOutreachInteractionRow } from "./ProductOutreachInteractionRow";

interface ProductOutreachContactCardProps {
  contact: ProductOutreachContactWithInteractions;
  onEditLabel: () => void;
  onAddInteraction: () => void;
  onDeleteContact: () => void;
  onEditInteraction: (
    interaction: ProductOutreachContactWithInteractions["interactions"][number],
  ) => void;
  onDeleteInteraction: (
    interaction: ProductOutreachContactWithInteractions["interactions"][number],
  ) => void;
}

export function ProductOutreachContactCard({
  contact,
  onEditLabel,
  onAddInteraction,
  onDeleteContact,
  onEditInteraction,
  onDeleteInteraction,
}: ProductOutreachContactCardProps) {
  const title = getContactDisplayTitle(contact.label, contact.interactions);

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </h3>
          {contact.label.trim() ? (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {contact.interactions.length} interaction
              {contact.interactions.length === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEditLabel}
            className={mobileActionClass.edit}
          >
            Edit label
          </button>
          <button
            type="button"
            onClick={onAddInteraction}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add interaction
          </button>
          <button
            type="button"
            onClick={onDeleteContact}
            className={mobileActionClass.delete}
          >
            Delete contact
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {contact.interactions.map((interaction) => (
          <ProductOutreachInteractionRow
            key={interaction.id}
            interaction={interaction}
            onEdit={() => onEditInteraction(interaction)}
            onDelete={() => onDeleteInteraction(interaction)}
          />
        ))}
      </div>
    </article>
  );
}
