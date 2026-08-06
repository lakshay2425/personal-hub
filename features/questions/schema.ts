import { z } from "zod";

export const questionFormSchema = z.object({
  questionText: z
    .string()
    .trim()
    .min(3, "Question must be at least 3 characters")
    .max(500, "Question must be under 500 characters"),
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;

export const projectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(120, "Project name must be under 120 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be under 500 characters")
    .optional()
    .or(z.literal("")),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const answerFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be under 120 characters"),
  body: z
    .string()
    .trim()
    .min(1, "Answer body is required")
    .max(5000, "Answer must be under 5000 characters"),
});

export type AnswerFormValues = z.infer<typeof answerFormSchema>;
