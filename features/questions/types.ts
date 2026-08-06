export type QuestionStatus = "answered" | "unanswered";

export type QuestionDepth = 0 | 1 | 2;

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Question {
  id: string;
  projectId: string | null;
  parentId: string | null;
  depth: QuestionDepth;
  questionText: string;
  status: QuestionStatus;
  createdAt: number;
  updatedAt: number;
  answeredAt: number | null;
}

export interface Answer {
  id: string;
  projectId: string | null;
  questionId: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export type QuestionTreeNode = Question & {
  children: QuestionTreeNode[];
};
