import type {
  CreateFeatureInput,
  ProjectFeature,
  UpdateFeatureInput,
} from "../types";

export type NewProjectFeature = Omit<ProjectFeature, "id">;

export function createProjectFeatureRecord(
  input: CreateFeatureInput,
  createdAt: number,
): NewProjectFeature {
  return {
    projectId: input.projectId,
    versionId: input.versionId ?? null,
    title: input.title.trim(),
    status: input.status ?? "Idea",
    notes: input.notes?.trim() ?? "",
    createdAt,
  };
}

export function updateProjectFeatureRecord(
  existing: ProjectFeature,
  input: UpdateFeatureInput,
): ProjectFeature {
  return {
    ...existing,
    ...(input.title !== undefined && { title: input.title.trim() }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.notes !== undefined && { notes: input.notes.trim() }),
    ...(input.versionId !== undefined && { versionId: input.versionId }),
  };
}

export function didProjectFeatureStatusChange(
  input: UpdateFeatureInput,
  previousStatus?: ProjectFeature["status"],
): boolean {
  return (
    input.status !== undefined &&
    previousStatus !== undefined &&
    input.status !== previousStatus
  );
}
