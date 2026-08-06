import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

const routes = [
  "/",
  "/projects",
  "/content-ideas",
  "/logger",
  "/logger/dashboard",
  "/job-search",
  "/job-search/companies",
  "/job-search/leads",
  "/job-search/applications",
  "/job-search/cold-emails",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: new URL(route, SITE_URL).toString(),
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
