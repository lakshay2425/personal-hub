import { getDB } from "@/features/questions/lib/db";

import { logFeatureActivity } from "./activityLog";
import { deleteVersionsByProjectId } from "./versionsRepository";
import type {
  CreateFeatureInput,
  FeatureStatus,
  ProjectFeature,
  UpdateFeatureInput,
} from "../types";

function compareFeatures(a: ProjectFeature, b: ProjectFeature): number {
  return b.createdAt - a.createdAt;
}

export async function getFeaturesByProjectId(
  projectId: string,
): Promise<ProjectFeature[]> {
  const db = getDB();
  const features = await db.features
    .where("projectId")
    .equals(projectId)
    .toArray();
  return features.sort(compareFeatures);
}

export async function createFeature(
  input: CreateFeatureInput,
): Promise<ProjectFeature> {
  const db = getDB();
  const now = Date.now();

  const feature: ProjectFeature = {
    projectId: input.projectId,
    versionId: input.versionId ?? null,
    title: input.title.trim(),
    status: input.status ?? "Idea",
    notes: input.notes?.trim() ?? "",
    createdAt: now,
  };

  const id = await db.features.add(feature);
  await logFeatureActivity(id as number, "Feature Created");

  return { ...feature, id: id as number };
}

export async function updateFeature(
  id: number,
  input: UpdateFeatureInput,
  previousStatus?: FeatureStatus,
): Promise<ProjectFeature> {
  const db = getDB();
  const existing = await db.features.get(id);

  if (!existing) {
    throw new Error("Feature not found");
  }

  const updated: ProjectFeature = {
    ...existing,
    ...(input.title !== undefined && { title: input.title.trim() }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.notes !== undefined && { notes: input.notes.trim() }),
    ...(input.versionId !== undefined && { versionId: input.versionId }),
  };

  await db.features.put(updated);

  if (
    input.status !== undefined &&
    previousStatus !== undefined &&
    input.status !== previousStatus
  ) {
    await logFeatureActivity(id, "Feature Status Changed");
  }

  return updated;
}

export async function deleteFeature(id: number): Promise<void> {
  const db = getDB();
  await logFeatureActivity(id, "Feature Deleted");
  await db.features.delete(id);
}

export async function deleteFeaturesByProjectId(
  projectId: string,
): Promise<void> {
  const db = getDB();
  const features = await db.features
    .where("projectId")
    .equals(projectId)
    .toArray();

  for (const feature of features) {
    if (feature.id) {
      await logFeatureActivity(feature.id, "Feature Deleted");
    }
  }

  await db.features.where("projectId").equals(projectId).delete();
}

export async function deleteProjectFeaturesAndVersions(
  projectId: string,
): Promise<void> {
  await deleteFeaturesByProjectId(projectId);
  await deleteVersionsByProjectId(projectId);
}
