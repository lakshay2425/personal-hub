import { z } from "zod";

import { getTodayDateString } from "./lib/dateUtils";

export const logEntryFormSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .refine(
      (date) => date <= getTodayDateString(),
      "You can only log entries for today or past dates",
    ),
  text: z
    .string()
    .trim()
    .min(1, "Entry text is required")
    .max(2000, "Entry must be under 2000 characters"),
});

export type LogEntryFormValues = z.infer<typeof logEntryFormSchema>;
