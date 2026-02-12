import { prisma } from "../config/database";

export type AuthContext = {
  userId: string;
  orgId: string;
  email: string;
};

type ActivityMeta = Record<string, unknown>;

export const activityService = {
  async log(ctx: AuthContext, params: {
    type: string;
    message?: string;
    boardId?: string;
    columnId?: string;
    taskId?: string;
    meta?: ActivityMeta;
  }) {
    return prisma.activityLog.create({
      data: {
        organizationId: ctx.orgId,
        userId: ctx.userId,
        type: params.type,
        message: params.message,
        boardId: params.boardId,
        columnId: params.columnId,
        taskId: params.taskId,
        meta: (params.meta ?? {}) as object
      }
    });
  }
};

