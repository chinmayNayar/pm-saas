import { NotificationType } from "@prisma/client";
import { prisma } from "../config/database";
import { emitNotificationCreated } from "../sockets/emitters";

export type NotificationContext = {
  orgId?: string;
};

export class NotificationService {
  // Generic creator used by domain services (tasks, payments, etc.)
  async createNotification(params: {
    userId: string;
    organizationId?: string;
    type: NotificationType;
    title: string;
    message?: string;
    meta?: Record<string, unknown>;
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        organizationId: params.organizationId,
        type: params.type,
        title: params.title,
        message: params.message,
        meta: (params.meta ?? {}) as object
      }
    });

    emitNotificationCreated({
      id: notification.id,
      userId: notification.userId,
      organizationId: notification.organizationId ?? undefined,
      type: notification.type,
      message: notification.message ?? ""
    });

    return notification;
  }

  async listForUser(userId: string, options: { limit?: number; cursor?: string } = {}) {
    const { limit = 50, cursor } = options;

    return prisma.notification.findMany({
      where: {
        userId,
        deletedAt: null
      },
      take: limit,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor }
          }
        : {}),
      orderBy: { createdAt: "desc" }
    });
  }

  async countUnread(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
        deletedAt: null
      }
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        deletedAt: null
      }
    });
    if (!notification) {
      throw new Error("Notification not found");
    }

    return prisma.notification.update({
      where: { id: notification.id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        deletedAt: null
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }
}

export const notificationService = new NotificationService();

