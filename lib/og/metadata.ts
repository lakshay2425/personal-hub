import type { Metadata } from "next";

import { getOgSection, type OgSectionId } from "@/lib/og/sections";
import { SITE_NAME } from "@/lib/site";

export function createSectionMetadata(
  sectionId: OgSectionId,
  pathname: `/${string}` | "/",
): Metadata {
  const section = getOgSection(sectionId);

  return {
    title: section.title,
    description: section.description,
    keywords: section.keywords ?? [section.title, SITE_NAME],
    alternates: {
      canonical: pathname,
    },
    ...(section.noIndex
      ? {
          robots: {
            index: false,
            follow: true,
            googleBot: { index: false, follow: true },
          },
        }
      : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: section.title,
      description: section.description,
      url: pathname,
    },
    twitter: {
      card: "summary_large_image",
      title: section.title,
      description: section.description,
    },
  };
}
