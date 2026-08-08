"use client";

import { Pencil, Trash2 } from "lucide-react";

import type { ProjectFeature, ProjectVersion } from "../types";
import { FeatureNotesIcon } from "./FeatureNotesIcon";
import { FeatureStatusBadge } from "./FeatureStatusBadge";

interface FeaturesTableProps {
  features: ProjectFeature[];
  versions: ProjectVersion[];
  onEdit: (feature: ProjectFeature) => void;
  onDelete: (feature: ProjectFeature) => void;
}

function getVersionName(
  versionId: number | null,
  versions: ProjectVersion[],
): string {
  if (versionId === null) return "—";
  return versions.find((version) => version.id === versionId)?.name ?? "—";
}

export function FeaturesTable({
  features,
  versions,
  onEdit,
  onDelete,
}: FeaturesTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-900/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Title
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Version
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Status
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Notes
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
          {features.map((feature) => (
            <tr key={feature.id}>
              <td className="max-w-[12rem] px-4 py-3 text-sm font-medium break-words text-zinc-900 sm:max-w-none dark:text-zinc-50">
                {feature.title}
              </td>
              <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                {getVersionName(feature.versionId, versions)}
              </td>
              <td className="px-4 py-3">
                <FeatureStatusBadge status={feature.status} />
              </td>
              <td className="px-4 py-3 text-center">
                <FeatureNotesIcon notes={feature.notes} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(feature)}
                    className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    aria-label="Edit feature"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(feature)}
                    className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    aria-label="Delete feature"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
