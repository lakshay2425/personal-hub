"use client";

import { useCallback, useState } from "react";

export function useBulkSelection<T extends string | number>() {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(() => new Set());

  const isSelected = useCallback(
    (id: T) => selectedIds.has(id),
    [selectedIds],
  );

  const toggle = useCallback((id: T) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: T[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    isSelected,
    toggle,
    selectAll,
    clear,
  };
}
