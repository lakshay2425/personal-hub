export function truncateText(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }

  return `${trimmed.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

export function wrapDescription(
  text: string,
  maxLines: number,
  maxCharsPerLine: number,
): string[] {
  const words = truncateText(text, maxLines * maxCharsPerLine).split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    if (lines.length === maxLines - 1) {
      const rest = words.slice(i).join(" ");
      lines.push(truncateText(rest, maxCharsPerLine));
      return lines;
    }

    current = word;
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  return lines;
}
