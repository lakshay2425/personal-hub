import { randomUUID } from "node:crypto";
import { createSerwistRoute } from "@serwist/turbopack";

// Use a per-build random revision instead of `git rev-parse HEAD`.
// The Docker Alpine builder image has no git, and a fresh UUID still
// cache-busts the offline fallback entry on every deploy.
const revision = randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [{ url: "/~offline", revision }],
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
  });
