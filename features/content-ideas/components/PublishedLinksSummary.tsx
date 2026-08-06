import type { PublishedLinks } from "../types";

interface PublishedLinksSummaryProps {
  links: PublishedLinks;
}

export function PublishedLinksSummary({ links }: PublishedLinksSummaryProps) {
  const entries = [
    links.linkedin && { label: "LinkedIn", href: links.linkedin },
    links.twitter && { label: "Twitter", href: links.twitter },
    links.blog && { label: "Blog", href: links.blog },
    links.other && { label: "Other", href: links.other },
  ].filter(Boolean) as { label: string; href: string }[];

  if (entries.length === 0) {
    return <span className="text-xs text-zinc-400 dark:text-zinc-500">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map((entry) => (
        <a
          key={entry.label}
          href={entry.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
        >
          {entry.label}
        </a>
      ))}
    </div>
  );
}
