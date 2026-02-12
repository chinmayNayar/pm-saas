"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeService = exports.PLAN_PRICE_MAP = void 0;
const stripe_1 = require("../config/stripe");
const env_1 = require("../config/env");
exports.PLAN_PRICE_MAP = {
    free: env_1.env.stripe.prices.free,
    pro: env_1.env.stripe.prices.pro,
    enterprise: env_1.env.stripe.prices.enterprise
};
class StripeService {
    async createCustomer(email, name) {
        return stripe_1.stripe.customers.create({ email, name });
    }
    async createCheckoutSession(params) {
        const { customerId, planId, successUrl, cancelUrl, orgId } = params;
        const priceId = exports.PLAN_PRICE_MAP[planId];
        if (!priceId) {
            throw new Error(`Missing Stripe price for plan ${planId}`);
        }
        return stripe_1.stripe.checkout.sessions.create({
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
    constructWebhookEvent(payload, sig) {
        return stripe_1.stripe.webhooks.constructEvent(payload, sig, env_1.env.stripe.webhookSecret);
    }
}
exports.stripeService = new StripeService();
