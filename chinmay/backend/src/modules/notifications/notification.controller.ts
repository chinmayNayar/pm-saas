import { Request, Response, NextFunction } from "express";
import { notificationService } from "../../services/notification.service";
import { ok } from "../../utils/apiResponse";

class NotificationController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.id;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const cursor = req.query.cursor as string | undefined;

      const notifications = await notificationService.listForUser(userId, {
        limit,
        cursor
      });

      return ok(res, notifications);
    } catch (err) {
      next(err);
    }
  }

  async countUnread(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.id;
      const count = await notificationService.countUnread(userId);
      return ok(res, { count });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.id;
      const { id } = req.params;
      const updated = await notificationService.markAsRead(userId, id);
      return ok(res, updated, "Notification marked as read");
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.id;
      await notificationService.markAllAsRead(userId);
      return ok(res, null, "All notifications marked as read");
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();

