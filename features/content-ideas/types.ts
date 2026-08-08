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
  /** YYYY-MM-DD date string, or null if not scheduled */
  scheduledDate: string | null;
  createdAt: number;
}

export type CalendarViewMode = "month" | "week";

export type ContentIdeaTreeNode = ContentIdea & {
  children: ContentIdeaTreeNode[];
};

export type ContentIdeaEntityType = "contentIdea";

export type QuestionHubEntityType = "contentIdea" | "task";

export interface QuestionHubActivityLog {
  id?: number;
  entityType: QuestionHubEntityType;
  entityId: number;
  action: string;
  timestamp: number;
}

/** @deprecated Use QuestionHubActivityLog */
export type ContentIdeaActivityLog = QuestionHubActivityLog;

export const EMPTY_PUBLISHED_LINKS: PublishedLinks = {
  linkedin: "",
  twitter: "",
  blog: "",
  other: "",
};
