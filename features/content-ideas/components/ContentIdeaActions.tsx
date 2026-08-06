interface ContentIdeaActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
}

export function ContentIdeaActions({
  onEdit,
  onDelete,
  compact = false,
}: ContentIdeaActionsProps) {
  return (
    <div className={`flex gap-2 ${compact ? "" : "justify-end"}`}>
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        Delete
      </button>
    </div>
  );
}
