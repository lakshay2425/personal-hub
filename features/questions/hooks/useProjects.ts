"use client";

import { useCallback, useEffect, useState } from "react";

import type { Project } from "../types";
import {
  createProject as createProjectRepo,
  deleteProject as deleteProjectRepo,
  getAllProjects,
  getProjectById,
  updateProject as updateProjectRepo,
} from "../lib/projectsRepository";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getAllProjects();
        if (!cancelled) {
          setProjects(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load projects");
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
  }, []);

  const createProject = useCallback(
    async (input: { name: string; description?: string | null }) => {
      const created = await createProjectRepo(input);
      setProjects((prev) =>
        [created, ...prev].sort((a, b) => b.updatedAt - a.updatedAt),
      );
      return created;
    },
    [],
  );

  const updateProject = useCallback(
    async (
      id: string,
      input: { name: string; description?: string | null },
    ) => {
      const updated = await updateProjectRepo(id, input);
      setProjects((prev) =>
        prev
          .map((project) => (project.id === id ? updated : project))
          .sort((a, b) => b.updatedAt - a.updatedAt),
      );
      return updated;
    },
    [],
  );

  const deleteProject = useCallback(async (id: string) => {
    await deleteProjectRepo(id);
    setProjects((prev) => prev.filter((project) => project.id !== id));
  }, []);

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refresh,
  };
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getProjectById(projectId);
      setProject(data ?? null);
      if (!data) {
        setError("Project not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!cancelled) {
          setIsLoading(true);
        }
        const data = await getProjectById(projectId);
        if (!cancelled) {
          setProject(data ?? null);
          setError(data ? null : "Project not found");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load project");
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

  return { project, isLoading, error, refresh };
}
