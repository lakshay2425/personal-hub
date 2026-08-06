"use client";

import type { Project } from "../types";
import type { ProjectFormValues } from "../schema";
import { Modal } from "./Modal";
import { ProjectForm } from "./ProjectForm";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  project?: Project | null;
}

export function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  project,
}: ProjectFormModalProps) {
  const isEdit = Boolean(project);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit project" : "New project"}
    >
      <ProjectForm
        key={project?.id ?? "create"}
        defaultValues={
          project
            ? {
                name: project.name,
                description: project.description ?? "",
              }
            : undefined
        }
        onSubmit={onSubmit}
        onCancel={onClose}
        submitLabel={isEdit ? "Update" : "Create"}
      />
    </Modal>
  );
}
