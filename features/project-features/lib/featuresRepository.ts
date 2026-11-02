import { getDB } from "@/features/questions/lib/db";

import { logFeatureActivity } from "./activityLog";
import { deleteVersionsByProjectId } from "./versionsRepository";
import {
  createProjectFeatureRecord,
  didProjectFeatureStatusChange,
  updateProjectFeatureRecord,
} from "./featureUtils";
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
  const feature = createProjectFeatureRecord(input, Date.now());

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

  const updated = updateProjectFeatureRecord(existing, input);

  await db.features.put(updated);

  if (didProjectFeatureStatusChange(input, previousStatus)) {
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
