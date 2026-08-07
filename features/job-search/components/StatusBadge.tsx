interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantClasses: Record<NonNullable<StatusBadgeProps["variant"]>, string> =
  {
    default:
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    success:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    warning:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    danger:
      "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  };

export function getStatusVariant(status: string): StatusBadgeProps["variant"] {
  switch (status) {
    case "Interview":
    case "Offer":
    case "Positive Response":
    case "Replied":
      return "success";
    case "Rejected":
    case "Inactive":
    case "Closed":
      return "danger";
    case "Contacted":
    case "Sent":
    case "Applied":
      return "info";
    case "Draft":
    case "New":
      return "warning";
    case "Joined":
      return "success";
    default:
      return "default";
  }
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const resolvedVariant = variant ?? getStatusVariant(status);
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[resolvedVariant ?? "default"]}`}
    >
      {status}
    </span>
  );
}
