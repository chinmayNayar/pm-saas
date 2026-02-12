import { Router, Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { authMiddleware } from "../../middleware/authMiddleware";
import { loadOrgContext } from "../../middleware/loadOrgContext";
import { validateRequest } from "../../middleware/validateRequest";
import { billingController } from "./billing.controller";

export const billingRouter = Router();

billingRouter.use(authMiddleware, loadOrgContext);

// POST /api/v1/billing/checkout-session
billingRouter.post(
  "/checkout-session",
  [
    body("planId").isIn(["free", "pro", "enterprise"]),
    body("successUrl").isURL(),
    body("cancelUrl").isURL()
  ],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => billingController.createCheckoutSession(req, res, next)
);

