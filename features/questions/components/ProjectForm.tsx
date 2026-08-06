"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { projectFormSchema, type ProjectFormValues } from "../schema";

interface ProjectFormProps {
  defaultValues?: ProjectFormValues;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ProjectForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaultValues ?? { name: "", description: "" },
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
          htmlFor="projectName"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Project name
        </label>
        <input
          id="projectName"
          type="text"
          placeholder="e.g. iOS Resource Hub"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="projectDescription"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Description (optional)
        </label>
        <textarea
          id="projectDescription"
          rows={3}
          placeholder="What is this project about?"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          {...register("description")}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 sm:w-auto dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
