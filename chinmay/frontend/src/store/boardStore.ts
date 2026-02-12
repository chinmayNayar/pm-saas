import { create } from "zustand";

export type Task = { id: string; title: string; columnId: string };
export type Column = { id: string; title: string; taskIds: string[] };

type BoardState = {
  columns: Column[];
  tasks: Record<string, Task>;
  setBoard: (columns: Column[], tasks: Task[]) => void;
  moveTask: (taskId: string, toColumnId: string, index: number) => void;
};

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: [],
  tasks: {},
  setBoard: (columns, tasks) =>
    set({
      columns,
      tasks: tasks.reduce<Record<string, Task>>((acc, t) => {
        acc[t.id] = t;
        return acc;
      }, {})
    }),
  moveTask: (taskId, toColumnId, index) => {
    const { columns, tasks } = get();
    const task = tasks[taskId];
    if (!task) return;

    const nextColumns = columns.map((col) => {
      let ids = [...col.taskIds];
      if (ids.includes(taskId)) {
        ids = ids.filter((id) => id !== taskId);
      }
      if (col.id === toColumnId) {
        ids.splice(index, 0, taskId);
      }
      return { ...col, taskIds: ids };
    });

    set({
      columns: nextColumns,
      tasks: { ...tasks, [taskId]: { ...task, columnId: toColumnId } }
    });
  }
}));

