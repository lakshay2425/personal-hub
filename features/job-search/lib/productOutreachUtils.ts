import { normalizeProfileUrl } from "./leadProfileUtils";
import type { ProductOutreachChannel } from "../types";

export function formatHandleDisplay(
  channel: ProductOutreachChannel,
  handle: string,
): string {
  const trimmed = handle.trim();
  if (!trimmed) return "—";

  if (channel === "Instagram") {
    const username = trimmed.replace(/^@+/, "");
    return `@${username}`;
  }

  if (channel === "X" && !trimmed.includes("/") && !trimmed.includes(".")) {
    return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
  }

  return trimmed;
}

export function getInteractionUrl(
  channel: ProductOutreachChannel,
  handle: string,
): string | null {
  const trimmed = handle.trim();
  if (!trimmed) return null;

  switch (channel) {
    case "Instagram": {
      const username = trimmed.replace(/^@+/, "").split(/[/?#]/)[0];
      if (!username) return null;
      return `https://instagram.com/${username}`;
    }
    case "LinkedIn":
      return normalizeProfileUrl(trimmed);
    case "X": {
      if (/^https?:\/\//i.test(trimmed) || trimmed.includes(".")) {
        return normalizeProfileUrl(trimmed);
      }
      const username = trimmed.replace(/^@+/, "").split(/[/?#]/)[0];
      if (!username) return null;
      return `https://x.com/${username}`;
    }
    case "Email":
      return `mailto:${trimmed}`;
    default:
      return null;
  }
}

export function getContactDisplayTitle(
  label: string,
  interactions: { handle: string; channel: ProductOutreachChannel }[],
): string {
  if (label.trim()) return label.trim();

  const first = interactions[0];
  if (!first) return "Untitled contact";

  return formatHandleDisplay(first.channel, first.handle);
}

export function getHandlePlaceholder(channel: ProductOutreachChannel): string {
  switch (channel) {
    case "Instagram":
      return "janedoe";
    case "LinkedIn":
      return "linkedin.com/in/...";
    case "X":
      return "username or https://x.com/...";
    case "Email":
      return "jane@example.com";
  }
}
