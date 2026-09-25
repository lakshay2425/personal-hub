export type TaskKind = "inbox" | "sprint" | "recursive";
export type TaskStatus = "Todo" | "Done";
export type TaskDepth = 0 | 1 | 2;

export interface Task {
  id?: number;
  kind: TaskKind;
  parentId: number | null;
  depth: TaskDepth;
  sortOrder: number;
  title: string;
  status: TaskStatus;
  completedAt: number | null;
  notes: string;
  createdAt: number;
}

export type TaskTreeNode = Task & {
  children: TaskTreeNode[];
};

export interface CreateTaskInput {
  title: string;
  notes?: string;
  kind?: TaskKind;
}

export interface CreateSubTaskInput {
  title: string;
  notes?: string;
}

export interface UpdateTaskInput {
  title?: string;
  notes?: string;
}
