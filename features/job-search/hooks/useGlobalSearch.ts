"use client";

import { useCallback, useEffect, useState } from "react";

import { globalSearch } from "../repositories/searchRepository";
import type { GlobalSearchResult } from "../types";

export function useGlobalSearch(query: string) {
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const data = await globalSearch(q);
      setResults(data);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void search(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return { results, isSearching };
}
