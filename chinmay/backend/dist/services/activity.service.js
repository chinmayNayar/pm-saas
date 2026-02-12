"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityService = void 0;
const database_1 = require("../config/database");
exports.activityService = {
    async log(ctx, params) {
        return database_1.prisma.activityLog.create({
            data: {
                organizationId: ctx.orgId,
                userId: ctx.userId,
                type: params.type,
                message: params.message,
                boardId: params.boardId,
                columnId: params.columnId,
                taskId: params.taskId,
                meta: (params.meta ?? {})
            }
        });
    }
};
