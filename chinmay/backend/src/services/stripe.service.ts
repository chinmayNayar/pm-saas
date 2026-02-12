import { stripe } from "../config/stripe";
import { env } from "../config/env";
import type Stripe from "stripe";

export type PlanId = "free" | "pro" | "enterprise";

export const PLAN_PRICE_MAP: Record<PlanId, string> = {
  free: env.stripe.prices.free,
  pro: env.stripe.prices.pro,
  enterprise: env.stripe.prices.enterprise
};

class StripeService {
  async createCustomer(email: string, name?: string) {
    return stripe.customers.create({ email, name });
  }

  async createCheckoutSession(params: {
    customerId: string;
    planId: PlanId;
    successUrl: string;
    cancelUrl: string;
    orgId: string;
  }) {
    const { customerId, planId, successUrl, cancelUrl, orgId } = params;
    const priceId = PLAN_PRICE_MAP[planId];
    if (!priceId) {
      throw new Error(`Missing Stripe price for plan ${planId}`);
    }

    return stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orgId,
        planId
      }
    });
  }

  constructWebhookEvent(payload: Buffer, sig: string): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, sig, env.stripe.webhookSecret);
  }
}

export const stripeService = new StripeService();

