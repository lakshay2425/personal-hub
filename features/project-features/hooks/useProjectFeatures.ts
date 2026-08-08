"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createFeature as createFeatureRepo,
  deleteFeature as deleteFeatureRepo,
  getFeaturesByProjectId,
  updateFeature as updateFeatureRepo,
} from "../lib/featuresRepository";
import {
  createVersion as createVersionRepo,
  getVersionsByProjectId,
} from "../lib/versionsRepository";
import type {
  CreateFeatureInput,
  FeatureStatus,
  ProjectFeature,
  ProjectVersion,
  UpdateFeatureInput,
} from "../types";

export function useProjectFeatures(projectId: string) {
  const [features, setFeatures] = useState<ProjectFeature[]>([]);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [loadedFeatures, loadedVersions] = await Promise.all([
      getFeaturesByProjectId(projectId),
      getVersionsByProjectId(projectId),
    ]);
    setFeatures(loadedFeatures);
    setVersions(loadedVersions);
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const [loadedFeatures, loadedVersions] = await Promise.all([
          getFeaturesByProjectId(projectId),
          getVersionsByProjectId(projectId),
        ]);
        if (!cancelled) {
          setFeatures(loadedFeatures);
          setVersions(loadedVersions);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load features");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const addFeature = useCallback(
    async (input: CreateFeatureInput) => {
      const created = await createFeatureRepo(input);
      await reload();
      return created;
    },
    [reload],
  );

  const editFeature = useCallback(
    async (
      id: number,
      input: UpdateFeatureInput,
      previousStatus?: FeatureStatus,
    ) => {
      const updated = await updateFeatureRepo(id, input, previousStatus);
      await reload();
      return updated;
    },
    [reload],
  );

  const removeFeature = useCallback(
    async (id: number) => {
      await deleteFeatureRepo(id);
      await reload();
    },
    [reload],
  );

  const createVersion = useCallback(
    async (name: string) => {
      const created = await createVersionRepo(projectId, name);
      await reload();
      return created;
    },
    [projectId, reload],
  );

  return {
    features,
    versions,
    isLoading,
    error,
    addFeature,
    editFeature,
    removeFeature,
    createVersion,
    reload,
  };
}
