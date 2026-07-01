export type QuestionStatus = "answered" | "unanswered";

export interface Question {
  id: string;
  questionText: string;
  status: QuestionStatus;
  createdAt: number;
  updatedAt: number;
  answeredAt: number | null;
}
