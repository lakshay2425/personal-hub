export type FeatureStatus =
  | "Idea"
  | "Planned"
  | "In Progress"
  | "Done"
  | "Dropped";

export interface ProjectVersion {
  id?: number;
  projectId: string;
  name: string;
  createdAt: number;
}

export interface ProjectFeature {
  id?: number;
  projectId: string;
  versionId: number | null;
  title: string;
  status: FeatureStatus;
  notes: string;
  createdAt: number;
}

export interface CreateFeatureInput {
  projectId: string;
  versionId?: number | null;
  title: string;
  status?: FeatureStatus;
  notes?: string;
}

export interface UpdateFeatureInput {
  versionId?: number | null;
  title?: string;
  status?: FeatureStatus;
  notes?: string;
}
