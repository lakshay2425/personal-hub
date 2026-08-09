export type TaskPriority = "High" | "Medium" | "Low";
export type TaskStatus = "Todo" | "Done";
export type TaskDepth = 0 | 1 | 2;

export interface Task {
  id?: number;
  weekStart: string;
  parentId: number | null;
  depth: TaskDepth;
  sortOrder: number;
  title: string;
  priority: TaskPriority | null;
  status: TaskStatus;
  completedAt: number | null;
  notes: string;
  createdAt: number;
}

export type TaskTreeNode = Task & {
  children: TaskTreeNode[];
};

export interface CreateTaskInput {
  weekStart: string;
  title: string;
  priority?: TaskPriority;
  notes?: string;
}

export interface CreateSubTaskInput {
  title: string;
  priority?: TaskPriority | null;
  notes?: string;
}

export interface UpdateTaskInput {
  title?: string;
  priority?: TaskPriority | null;
  notes?: string;
  weekStart?: string;
}
