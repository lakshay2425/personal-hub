import type { Lead } from "../types";

export function normalizeProfileUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getLeadProfileUrl(lead: Lead): string | null {
  if (lead.channel !== "LinkedIn" && lead.channel !== "X") return null;

  const raw =
    lead.channel === "LinkedIn"
      ? lead.linkedin?.trim()
      : lead.xProfile?.trim() || lead.linkedin?.trim();

  if (!raw) return null;
  return normalizeProfileUrl(raw);
}

export function getLeadProfileLabel(channel: Lead["channel"]): string {
  switch (channel) {
    case "LinkedIn":
      return "LinkedIn Profile";
    case "X":
      return "X Profile";
    default:
      return "LinkedIn";
  }
}

export function backfillLeadProfileFields(lead: Lead): Lead {
  const linkedin = lead.linkedin ?? "";
  let xProfile = lead.xProfile ?? "";

  if (lead.channel === "X" && !xProfile.trim() && linkedin.trim()) {
    xProfile = linkedin;
  }

  return {
    ...lead,
    linkedin,
    xProfile,
  };
}
