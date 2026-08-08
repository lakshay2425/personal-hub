import { getDB } from "./db";

export async function exportProjectsData() {
  const db = getDB();
  const [projects, questions, answers, contentIdeas, activityLogs, tasks] =
    await Promise.all([
      db.projects.toArray(),
      db.questions.toArray(),
      db.answers.toArray(),
      db.contentIdeas.toArray(),
      db.activityLogs.toArray(),
      db.tasks.toArray(),
    ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    projects,
    questions,
    answers,
    contentIdeas,
    activityLogs,
    tasks,
  };
}
