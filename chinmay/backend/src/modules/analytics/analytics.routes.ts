import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { loadOrgContext } from "../../middleware/loadOrgContext";
import { analyticsController } from "./analytics.controller";

export const analyticsRouter = Router();

analyticsRouter.use(authMiddleware, loadOrgContext);

// GET /api/v1/analytics/dashboard
analyticsRouter.get("/dashboard", (req, res, next) =>
  analyticsController.dashboard(req, res, next)
);

