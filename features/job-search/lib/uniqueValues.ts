export function getUniqueStringValues(
  values: string[],
): string[] {
  const unique = new Set(
    values.map((value) => value.trim()).filter(Boolean),
  );
  return Array.from(unique).sort((a, b) => a.localeCompare(b));
}
