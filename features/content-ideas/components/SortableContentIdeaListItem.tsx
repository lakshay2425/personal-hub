"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ContentIdeaListItem } from "./ContentIdeaListItem";
import type { ComponentProps } from "react";

type SortableContentIdeaListItemProps = ComponentProps<typeof ContentIdeaListItem>;

export function SortableContentIdeaListItem(props: SortableContentIdeaListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.node.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.9 : undefined,
  };

  return (
    <ContentIdeaListItem
      {...props}
      itemRef={setNodeRef}
      style={style}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}
