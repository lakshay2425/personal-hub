export type ContentIdeaStatus = "Draft" | "Ready" | "Published";

export type ContentIdeasViewMode = "table" | "cards";

export interface PublishedLinks {
  linkedin: string;
  twitter: string;
  blog: string;
  other: string;
}

export interface ContentIdea {
  id?: number;
  projectId: string | null;
  title: string;
  status: ContentIdeaStatus;
  publishedLinks: PublishedLinks;
  notes: string;
  createdAt: number;
}

export type ContentIdeaEntityType = "contentIdea";

export interface ContentIdeaActivityLog {
  id?: number;
  entityType: ContentIdeaEntityType;
  entityId: number;
  action: string;
  timestamp: number;
}

export const EMPTY_PUBLISHED_LINKS: PublishedLinks = {
  linkedin: "",
  twitter: "",
  blog: "",
  other: "",
};
