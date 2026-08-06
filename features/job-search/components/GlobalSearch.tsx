"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { useGlobalSearch } from "../hooks/useGlobalSearch";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { results, isSearching } = useGlobalSearch(query);
  const containerRef = useRef<HTMLDivElement>(null);

  const showResults = isFocused && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder="Search companies, leads, applications..."
        className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
      />
      {showResults && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {isSearching ? (
            <p className="px-4 py-3 text-sm text-zinc-500">Searching...</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-zinc-500">No results found</p>
          ) : (
            results.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                href={result.href}
                className="block border-b border-zinc-100 px-4 py-3 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {result.title}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {result.type} · {result.subtitle}
                </p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
