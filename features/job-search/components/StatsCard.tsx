import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  href?: string;
}

export function StatsCard({ label, value, href }: StatsCardProps) {
  const content = (
    <div className="flex items-center justify-between gap-3">
      <div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      </div>
      {href ? <ArrowRight className="h-5 w-5 text-zinc-400" aria-hidden="true" /> : null}
    </div>
  );
  const className = "block rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/70";
  return href ? <Link href={href} className={className}>{content}</Link> : <div className={className}>{content}</div>;
}
