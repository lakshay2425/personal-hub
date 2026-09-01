import type { ContentIdeaStatus, ContentIdeaType } from "./types";

export const CONTENT_IDEA_STATUSES: ContentIdeaStatus[] = [
  "Draft",
  "Ready",
  "Published",
];

export const CONTENT_IDEA_TYPES: ContentIdeaType[] = [
  "Blog",
  "Reel",
  "Post",
  "YT Video",
  "Other",
];

export const DEFAULT_CONTENT_IDEA_TYPE: ContentIdeaType = "Post";
