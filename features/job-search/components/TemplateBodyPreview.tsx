"use client";

import {
  isTemplatePlaceholder,
  splitBodyWithPlaceholders,
} from "../lib/templatePlaceholders";

interface TemplateBodyPreviewProps {
  body: string;
}

export function TemplateBodyPreview({ body }: TemplateBodyPreviewProps) {
  const segments = splitBodyWithPlaceholders(body);

  return (
    <p className="line-clamp-3 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
      {segments.map((segment, index) =>
        isTemplatePlaceholder(segment) ? (
          <span
            key={`${segment}-${index}`}
            className="rounded bg-blue-100 px-1 font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
          >
            {segment}
          </span>
        ) : (
          <span key={`${segment}-${index}`}>{segment}</span>
        ),
      )}
    </p>
  );
}
