"use client";

import type { Achievement } from "../types";
import { mobileActionClass } from "./MobileListCard";

interface AchievementCardsProps {
  achievements: Achievement[];
  onCopy: (achievement: Achievement, version: "concise" | "detailed") => void;
  onEdit: (achievement: Achievement) => void;
  onDelete: (achievement: Achievement) => void;
}

export function AchievementCards({
  achievements,
  onCopy,
  onEdit,
  onDelete,
}: AchievementCardsProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {achievements.map((achievement) => (
        <li
          key={achievement.id}
          className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="break-words text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {achievement.title}
          </h2>

          <div className="mt-4 space-y-3">
            <section className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/70">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Concise</h3>
                <button
                  type="button"
                  onClick={() => onCopy(achievement, "concise")}
                  className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-300"
                >
                  Copy concise
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {achievement.conciseVersion}
              </p>
            </section>

            <section className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/70">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Detailed</h3>
                <button
                  type="button"
                  onClick={() => onCopy(achievement, "detailed")}
                  className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-300"
                >
                  Copy detailed
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {achievement.detailedVersion}
              </p>
            </section>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => onEdit(achievement)}
              className={mobileActionClass.edit}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(achievement)}
              className={mobileActionClass.delete}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
