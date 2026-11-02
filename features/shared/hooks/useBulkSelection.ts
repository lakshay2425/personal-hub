"use client";

import { useCallback, useState } from "react";
import { replaceSelection, toggleSelection } from "../lib/selectionUtils";

export function useBulkSelection<T extends string | number>() {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(() => new Set());

  const isSelected = useCallback(
    (id: T) => selectedIds.has(id),
    [selectedIds],
  );

  const toggle = useCallback((id: T) => {
    setSelectedIds((prev) => toggleSelection(prev, id));
  }, []);

  const selectAll = useCallback((ids: T[]) => {
    setSelectedIds(replaceSelection(ids));
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
