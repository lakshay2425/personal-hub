import { createOgImage } from "@/lib/og/opengraph-image";

const og = createOgImage("templates");

export const alt = og.alt;
export const size = og.size;
export const contentType = og.contentType;
export default og.default;
