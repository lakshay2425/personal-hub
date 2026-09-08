import type { Metadata } from "next";

import { getOgSection, type OgSectionId } from "@/lib/og/sections";

export function createSectionMetadata(
  sectionId: OgSectionId,
  pathname: `/${string}` | "/",
): Metadata {
  const section = getOgSection(sectionId);

  return {
    title: section.title,
    description: section.description,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      title: section.title,
      description: section.description,
      url: pathname,
    },
    twitter: {
      title: section.title,
      description: section.description,
    },
  };
}
