import { renderOgImage } from "@/lib/og/renderOgImage";
import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  getOgSection,
  type OgSectionId,
} from "@/lib/og/sections";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export function createOgImage(sectionId: OgSectionId) {
  const section = getOgSection(sectionId);

  return {
    alt: section.alt,
    size,
    contentType,
    default: function Image() {
      return renderOgImage(section);
    },
  };
}
