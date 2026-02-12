"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const database_1 = require("../config/database");
const emitters_1 = require("../sockets/emitters");
class NotificationService {
    // Generic creator used by domain services (tasks, payments, etc.)
    async createNotification(params) {
        const notification = await database_1.prisma.notification.create({
            data: {
                userId: params.userId,
                organizationId: params.organizationId,
                type: params.type,
                title: params.title,
                message: params.message,
                meta: (params.meta ?? {})
            }
        });
        (0, emitters_1.emitNotificationCreated)({
            id: notification.id,
            userId: notification.userId,
            organizationId: notification.organizationId ?? undefined,
            type: notification.type,
            message: notification.message ?? ""
        });
        return notification;
    }
    async listForUser(userId, options = {}) {
        const { limit = 50, cursor } = options;
        return database_1.prisma.notification.findMany({
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
    async countUnread(userId) {
        return database_1.prisma.notification.count({
            where: {
                userId,
                isRead: false,
                deletedAt: null
            }
        });
    }
    async markAsRead(userId, notificationId) {
        const notification = await database_1.prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId,
                deletedAt: null
            }
        });
        if (!notification) {
            throw new Error("Notification not found");
        }
        return database_1.prisma.notification.update({
            where: { id: notification.id },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });
    }
    async markAllAsRead(userId) {
        await database_1.prisma.notification.updateMany({
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
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
