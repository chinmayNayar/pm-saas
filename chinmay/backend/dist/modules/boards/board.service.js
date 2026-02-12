"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boardService = void 0;
const database_1 = require("../../config/database");
const httpErrors_1 = require("../../utils/httpErrors");
exports.boardService = {
    async getBoardForOrg(organizationId, boardId) {
        const board = await database_1.prisma.board.findFirst({
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
        if (!board)
            throw new httpErrors_1.NotFoundError("Board not found");
        const columns = board.columns.map((col) => ({
            id: col.id,
            title: col.name,
            taskIds: col.tasks.map((t) => t.id)
        }));
        const tasks = board.columns.flatMap((col) => col.tasks.map((t) => ({ id: t.id, title: t.title, columnId: t.columnId })));
        return {
            board: { id: board.id, name: board.name },
            columns,
            tasks
        };
    }
};
