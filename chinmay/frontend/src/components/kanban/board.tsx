"use client";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { useBoardStore } from "../../store/boardStore";
import { Column } from "./column";

export function KanbanBoard() {
  const columns = useBoardStore((s) => s.columns);
  const moveTask = useBoardStore((s) => s.moveTask);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const taskId = String(active.id);
    const toColumnId = String(over.id);
    const targetColumn = columns.find((c) => c.id === toColumnId);
    if (!targetColumn) return;
    const insertIndex = targetColumn.taskIds.length;
    moveTask(taskId, toColumnId, insertIndex);
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <Column key={col.id} column={col} />
        ))}
      </div>
    </DndContext>
  );
}

