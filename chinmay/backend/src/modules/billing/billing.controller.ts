import { Request, Response, NextFunction } from "express";
import { subscriptionService } from "../../services/subscription.service";
import { ok } from "../../utils/apiResponse";
import { PlanId } from "../../services/stripe.service";

class BillingController {
  async createCheckoutSession(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = (req as any).authContext!;
      const { planId, successUrl, cancelUrl } = req.body as {
        planId: PlanId;
        successUrl: string;
        cancelUrl: string;
      };

      const session = await subscriptionService.createCheckoutSessionForOrg({
        orgId: ctx.orgId,
        planId,
        successUrl,
        cancelUrl
      });

      return ok(res, { url: session.url }, "Checkout session created");
    } catch (err) {
      next(err);
    }
  }
}

export const billingController = new BillingController();

