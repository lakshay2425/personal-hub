"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createAchievement,
  deleteAchievement,
  getAllAchievements,
  updateAchievement,
  type AchievementInput,
} from "../repositories/achievementsRepository";
import type { Achievement } from "../types";

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getAllAchievements();
    setAchievements(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getAllAchievements();
      if (!cancelled) {
        setAchievements(data);
        setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addAchievement = useCallback(async (data: AchievementInput) => {
    const id = await createAchievement(data);
    await refresh();
    return id;
  }, [refresh]);

  const editAchievement = useCallback(async (id: number, data: AchievementInput) => {
    await updateAchievement(id, data);
    await refresh();
  }, [refresh]);

  const removeAchievement = useCallback(async (id: number) => {
    await deleteAchievement(id);
    await refresh();
  }, [refresh]);

  return { achievements, isLoading, addAchievement, editAchievement, removeAchievement, refresh };
}
