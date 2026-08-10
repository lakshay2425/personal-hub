import type { ReactNode } from "react";

const itemClassName =
  "rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900";

export function MobileList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul className={`space-y-3 lg:hidden ${className ?? ""}`}>{children}</ul>
  );
}

export function MobileListItem({ children }: { children: ReactNode }) {
  return <li className={itemClassName}>{children}</li>;
}

export function MobileCardHeader({
  title,
  subtitle,
  badge,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="break-words font-medium text-zinc-900 dark:text-zinc-50">
          {title}
        </p>
        {subtitle ? (
          <div className="mt-0.5 break-words text-sm text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </div>
        ) : null}
      </div>
      {badge ? <div className="shrink-0">{badge}</div> : null}
    </div>
  );
}

export function MobileCardMeta({ children }: { children: ReactNode }) {
  return <dl className="mt-3 space-y-1.5">{children}</dl>;
}

export function MobileCardMetaRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <dt className="shrink-0 text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="min-w-0 text-right break-words text-zinc-700 dark:text-zinc-300">
        {value}
      </dd>
    </div>
  );
}

export function MobileCardActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      {children}
    </div>
  );
}

export const mobileActionClass = {
  edit: "text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
  delete: "text-sm text-red-600 hover:text-red-700 dark:text-red-400",
} as const;
