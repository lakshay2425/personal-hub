export function toggleSelection<T>(selected: ReadonlySet<T>, id: T): Set<T> {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function replaceSelection<T>(ids: readonly T[]): Set<T> {
  return new Set(ids);
}
