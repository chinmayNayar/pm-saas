"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const notification_service_1 = require("../../services/notification.service");
const apiResponse_1 = require("../../utils/apiResponse");
class NotificationController {
    async list(req, res, next) {
        try {
            const userId = req.user.id;
            const limit = req.query.limit ? Number(req.query.limit) : 50;
            const cursor = req.query.cursor;
            const notifications = await notification_service_1.notificationService.listForUser(userId, {
                limit,
                cursor
            });
            return (0, apiResponse_1.ok)(res, notifications);
        }
        catch (err) {
            next(err);
        }
    }
    async countUnread(req, res, next) {
        try {
            const userId = req.user.id;
            const count = await notification_service_1.notificationService.countUnread(userId);
            return (0, apiResponse_1.ok)(res, { count });
        }
        catch (err) {
            next(err);
        }
    }
    async markAsRead(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const updated = await notification_service_1.notificationService.markAsRead(userId, id);
            return (0, apiResponse_1.ok)(res, updated, "Notification marked as read");
        }
        catch (err) {
            next(err);
        }
    }
    async markAllAsRead(req, res, next) {
        try {
            const userId = req.user.id;
            await notification_service_1.notificationService.markAllAsRead(userId);
            return (0, apiResponse_1.ok)(res, null, "All notifications marked as read");
        }
        catch (err) {
            next(err);
        }
    }
}
exports.notificationController = new NotificationController();
