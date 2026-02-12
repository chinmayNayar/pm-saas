import { prisma } from "../../config/database";
import { NotFoundError } from "../../utils/httpErrors";

export type BoardResponse = {
  board: { id: string; name: string };
  columns: { id: string; title: string; taskIds: string[] }[];
  tasks: { id: string; title: string; columnId: string }[];
};

export const boardService = {
  async getBoardForOrg(organizationId: string, boardId: string): Promise<BoardResponse> {
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        organizationId,
        deletedAt: null
      },
      include: {
        columns: {
          where: { deletedAt: null },
          orderBy: { position: "asc" },
          include: {
            tasks: {
              where: { deletedAt: null },
              orderBy: { position: "asc" },
              select: { id: true, title: true, columnId: true }
            }
          }
        }
      }
    });

    if (!board) throw new NotFoundError("Board not found");

    const columns = board.columns.map((col) => ({
      id: col.id,
      title: col.name,
      taskIds: col.tasks.map((t) => t.id)
    }));

    const tasks = board.columns.flatMap((col) =>
      col.tasks.map((t) => ({ id: t.id, title: t.title, columnId: t.columnId }))
    );

    return {
      board: { id: board.id, name: board.name },
      columns,
      tasks
    };
  }
};
