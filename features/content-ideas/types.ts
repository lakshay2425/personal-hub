export type ContentIdeaStatus = "Draft" | "Ready" | "Published";

export type ContentIdeasViewMode = "table" | "cards" | "list";

export type ContentIdeaDepth = 0 | 1 | 2;

export interface PublishedLinks {
  linkedin: string;
  twitter: string;
  blog: string;
  other: string;
}

export interface ContentIdea {
  id?: number;
  projectId: string | null;
  parentId: number | null;
  depth: ContentIdeaDepth;
  sortOrder: number;
  title: string;
  status: ContentIdeaStatus;
  publishedLinks: PublishedLinks;
  notes: string;
  createdAt: number;
}

export type ContentIdeaTreeNode = ContentIdea & {
  children: ContentIdeaTreeNode[];
};

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
