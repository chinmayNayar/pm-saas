"use client";

import { useDroppable } from "@dnd-kit/core";
import { useBoardStore, Column as ColumnType } from "../../store/boardStore";
import { TaskCard } from "./task-card";

export function Column({ column }: { column: ColumnType }) {
  const tasks = useBoardStore((s) => s.tasks);
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`w-72 flex-shrink-0 rounded-lg bg-slate-900 p-3 min-h-[120px] ${
        isOver ? "ring-2 ring-primary/50" : ""
      }`}
    >
      <h3 className="text-sm font-semibold mb-2">{column.title}</h3>
      <div className="space-y-2">
        {column.taskIds.map((taskId) => {
          const task = tasks[taskId];
          if (!task) return null;
          return <TaskCard key={taskId} task={task} />;
        })}
      </div>
    </div>
  );
}

