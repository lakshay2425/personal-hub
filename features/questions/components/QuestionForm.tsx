"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  questionFormSchema,
  type QuestionFormValues,
} from "../schema";

interface QuestionFormProps {
  defaultValues?: QuestionFormValues;
  onSubmit: (values: QuestionFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function QuestionForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: QuestionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: defaultValues ?? { questionText: "" },
    mode: "onChange",
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="questionText"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Question
        </label>
        <textarea
          id="questionText"
          rows={4}
          placeholder="What would you like to ask?"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          {...register("questionText")}
        />
        {errors.questionText && (
          <p className="mt-1 text-sm text-red-600">
            {errors.questionText.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
