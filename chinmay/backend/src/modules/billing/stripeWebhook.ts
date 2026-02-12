import { Request, Response, NextFunction } from "express";
import { stripeService } from "../../services/stripe.service";
import { subscriptionService } from "../../services/subscription.service";

export async function stripeWebhookHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!sig) {
    return res.status(400).send("Missing Stripe signature");
  }

  try {
    const event = stripeService.constructWebhookEvent(
      req.body as Buffer,
      sig
    );

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await subscriptionService.handleStripeSubscriptionUpdated(event);
        break;
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
      case "invoice.marked_uncollectible":
        await subscriptionService.handleInvoiceEvent(event);
        break;
      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}

