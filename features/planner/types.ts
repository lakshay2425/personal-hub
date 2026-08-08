export type TaskPriority = "High" | "Medium" | "Low";
export type TaskStatus = "Todo" | "Done";

export interface Task {
  id?: number;
  weekStart: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt: number | null;
  notes: string;
  createdAt: number;
}

export interface CreateTaskInput {
  weekStart: string;
  title: string;
  priority?: TaskPriority;
  notes?: string;
}

export interface UpdateTaskInput {
  title?: string;
  priority?: TaskPriority;
  notes?: string;
  weekStart?: string;
}
