import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { notificationController } from "./notification.controller";

export const notificationRouter = Router();

notificationRouter.use(authMiddleware);

// GET /api/v1/notifications
notificationRouter.get("/", (req, res, next) =>
  notificationController.list(req, res, next)
);

// GET /api/v1/notifications/count
notificationRouter.get("/count", (req, res, next) =>
  notificationController.countUnread(req, res, next)
);

// POST /api/v1/notifications/:id/read
notificationRouter.post("/:id/read", (req, res, next) =>
  notificationController.markAsRead(req, res, next)
);

// POST /api/v1/notifications/read-all
notificationRouter.post("/read-all", (req, res, next) =>
  notificationController.markAllAsRead(req, res, next)
);

