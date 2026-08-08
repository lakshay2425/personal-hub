export interface LogEntry {
  id: string;
  date: string;
  text: string;
  source?: "planner";
  createdAt: number;
  updatedAt: number;
}
