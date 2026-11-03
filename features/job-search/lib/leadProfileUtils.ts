import type { Lead } from "../types";

export interface LeadSocialProfiles {
  linkedin: string | null;
  xProfile: string | null;
}

export function getLeadSocialProfiles(lead: Lead): LeadSocialProfiles {
  const profiles = backfillLeadProfileFields(lead);
  return {
    linkedin: normalizeSocialProfile(profiles.linkedin, ["linkedin.com"]),
    xProfile: normalizeSocialProfile(profiles.xProfile, ["x.com", "twitter.com"]),
  };
}

function normalizeSocialProfile(
  raw: string,
  domains: string[],
): string | null {
  if (!raw.trim()) return null;

  try {
    const url = new URL(normalizeProfileUrl(raw));
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      !domains.some(
        (domain) =>
          url.hostname === domain || url.hostname.endsWith(`.${domain}`),
      )
    ) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

export function getLinkedInProfileUrls(leads: Lead[]): string[] {
  const urls = leads.flatMap((lead) => {
    const raw = lead.linkedin?.trim() ?? "";
    if (!raw) return [];

    const normalized = normalizeProfileUrl(raw);
    try {
      const url = new URL(normalized);
      if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
      ) {
        return [];
      }
      if (
        url.hostname !== "linkedin.com" &&
        !url.hostname.endsWith(".linkedin.com")
      ) {
        return [];
      }
      url.hostname = url.hostname.replace(/^www\./, "");
      url.pathname = url.pathname.replace(/\/+$/, "") || "/";
      return [url.href];
    } catch {
      return [];
    }
  });
  return [...new Set(urls)];
}

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
