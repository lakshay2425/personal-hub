import { z } from "zod";

export const questionFormSchema = z.object({
  questionText: z
    .string()
    .trim()
    .min(3, "Question must be at least 3 characters")
    .max(500, "Question must be under 500 characters"),
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;
