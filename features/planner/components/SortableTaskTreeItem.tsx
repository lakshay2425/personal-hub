"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { TaskTreeItem } from "./TaskTreeItem";
import type { ComponentProps } from "react";

type SortableTaskTreeItemProps = ComponentProps<typeof TaskTreeItem>;

export function SortableTaskTreeItem(props: SortableTaskTreeItemProps) {
  const sortable = props.sortable !== false;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.node.id!,
    disabled: !sortable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.9 : undefined,
    ...props.style,
  };

  return (
    <TaskTreeItem
      {...props}
      itemRef={setNodeRef}
      style={style}
      dragHandleProps={
        sortable ? { ...attributes, ...listeners } : undefined
      }
    />
  );
}
