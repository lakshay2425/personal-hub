"use client";

import { useMemo, useState } from "react";

import type { ProjectVersion } from "../types";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500";

interface VersionComboboxProps {
  versions: ProjectVersion[];
  value: number | null;
  onChange: (versionId: number | null) => void;
  onCreateVersion: (name: string) => Promise<ProjectVersion>;
}

export function VersionCombobox({
  versions,
  value,
  onChange,
  onCreateVersion,
}: VersionComboboxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const selectedVersion = versions.find((version) => version.id === value);

  const filteredVersions = useMemo(() => {
    const lower = query.trim().toLowerCase();
    if (!lower) return versions;
    return versions.filter((version) =>
      version.name.toLowerCase().includes(lower),
    );
  }, [query, versions]);

  const trimmedQuery = query.trim();
  const exactMatch = versions.some(
    (version) => version.name.toLowerCase() === trimmedQuery.toLowerCase(),
  );
  const showCreateOption = trimmedQuery.length > 0 && !exactMatch;

  const displayValue = isOpen ? query : (selectedVersion?.name ?? "");

  const handleSelect = async (versionId: number | null) => {
    onChange(versionId);
    setQuery("");
    setIsOpen(false);
  };

  const handleCreate = async () => {
    if (!trimmedQuery || isCreating) return;
    setIsCreating(true);
    try {
      const created = await onCreateVersion(trimmedQuery);
      onChange(created.id ?? null);
      setQuery("");
      setIsOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
          if (!event.target.value.trim()) {
            onChange(null);
          }
        }}
        onFocus={() => {
          setQuery(selectedVersion?.name ?? "");
          setIsOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => setIsOpen(false), 150);
        }}
        placeholder="Unassigned — type to search or create"
        className={inputClass}
      />

      {isOpen && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <li>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => void handleSelect(null)}
              className="w-full px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Unassigned
            </button>
          </li>

          {filteredVersions.map((version) => (
            <li key={version.id}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void handleSelect(version.id ?? null)}
                className="w-full px-3 py-2 text-left text-sm text-zinc-900 hover:bg-zinc-50 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                {version.name}
              </button>
            </li>
          ))}

          {showCreateOption && (
            <li>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void handleCreate()}
                disabled={isCreating}
                className="w-full px-3 py-2 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
              >
                {isCreating
                  ? "Creating..."
                  : `+ Create "${trimmedQuery}" as new version`}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
