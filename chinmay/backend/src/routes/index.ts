import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { notificationRouter } from "../modules/notifications/notification.routes";
import { fileRouter } from "../modules/files/file.routes";
import { billingRouter } from "../modules/billing/billing.routes";
import { analyticsRouter } from "../modules/analytics/analytics.routes";
import { organizationRouter } from "../modules/organizations/organization.routes";
import { boardRouter } from "../modules/boards/board.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/organizations", organizationRouter);
apiRouter.use("/boards", boardRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/files", fileRouter);
apiRouter.use("/billing", billingRouter);
apiRouter.use("/analytics", analyticsRouter);

