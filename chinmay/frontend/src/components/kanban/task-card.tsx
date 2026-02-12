"use client";

import { useDraggable } from "@dnd-kit/core";
import type { Task } from "../../store/boardStore";

export function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="rounded bg-slate-800 px-3 py-2 text-sm shadow"
    >
      {task.title}
    </div>
  );
}

