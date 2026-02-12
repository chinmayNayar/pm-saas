import { Request, Response, NextFunction } from "express";
import { analyticsService } from "../../services/analytics.service";
import { ok } from "../../utils/apiResponse";

class AnalyticsController {
  async dashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = (req as any).authContext!;
      const data = await analyticsService.getDashboardAnalytics(ctx);
      return ok(res, data);
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();

