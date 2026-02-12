"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const notification_controller_1 = require("./notification.controller");
exports.notificationRouter = (0, express_1.Router)();
exports.notificationRouter.use(authMiddleware_1.authMiddleware);
// GET /api/v1/notifications
exports.notificationRouter.get("/", (req, res, next) => notification_controller_1.notificationController.list(req, res, next));
// GET /api/v1/notifications/count
exports.notificationRouter.get("/count", (req, res, next) => notification_controller_1.notificationController.countUnread(req, res, next));
// POST /api/v1/notifications/:id/read
exports.notificationRouter.post("/:id/read", (req, res, next) => notification_controller_1.notificationController.markAsRead(req, res, next));
// POST /api/v1/notifications/read-all
exports.notificationRouter.post("/read-all", (req, res, next) => notification_controller_1.notificationController.markAllAsRead(req, res, next));
