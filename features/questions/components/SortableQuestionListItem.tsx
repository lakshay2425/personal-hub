"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { QuestionListItem } from "./QuestionListItem";
import type { ComponentProps } from "react";

type SortableQuestionListItemProps = ComponentProps<typeof QuestionListItem>;

export function SortableQuestionListItem(props: SortableQuestionListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.9 : undefined,
  };

  return (
    <QuestionListItem
      {...props}
      itemRef={setNodeRef}
      style={style}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}
