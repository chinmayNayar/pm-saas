"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { axiosClient } from "../../../../lib/axiosClient";
import { useOrgStore } from "../../../../store/orgStore";
import { useBoardStore } from "../../../../store/boardStore";
import { KanbanBoard } from "../../../../components/kanban/board";
import { getSocket } from "../../../../lib/socket";
import type { Column as ColType, Task as TaskType } from "../../../../store/boardStore";

const DEMO_COLUMNS: ColType[] = [
  { id: "col-1", title: "To Do", taskIds: ["task-1", "task-2"] },
  { id: "col-2", title: "In Progress", taskIds: [] },
  { id: "col-3", title: "Done", taskIds: [] }
];
const DEMO_TASKS: TaskType[] = [
  { id: "task-1", title: "Sample task 1", columnId: "col-1" },
  { id: "task-2", title: "Sample task 2", columnId: "col-1" }
];

export default function BoardPage() {
  const params = useParams<{ boardId: string }>();
  const { currentOrg } = useOrgStore();
  const setBoard = useBoardStore((s) => s.setBoard);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!currentOrg) return;
    const headers = { "x-org-id": currentOrg.id };
    axiosClient
      .get(`/boards/${params.boardId}`, { headers })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setBoard(data.columns ?? [], data.tasks ?? []);
      })
      .catch(() => {
        setBoard(DEMO_COLUMNS, DEMO_TASKS);
      })
      .finally(() => setLoaded(true));
  }, [currentOrg, params.boardId, setBoard]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !currentOrg) return;
    socket.emit("org:join", currentOrg.id);
    socket.emit("board:join", params.boardId);
    return () => {
      socket.emit("board:leave", params.boardId);
    };
  }, [currentOrg, params.boardId]);

  if (!loaded) return <div className="text-slate-400">Loading board...</div>;
  return <KanbanBoard />;
}

