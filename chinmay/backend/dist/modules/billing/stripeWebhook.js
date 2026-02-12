"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookHandler = stripeWebhookHandler;
const stripe_service_1 = require("../../services/stripe.service");
const subscription_service_1 = require("../../services/subscription.service");
async function stripeWebhookHandler(req, res, next) {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
        return res.status(400).send("Missing Stripe signature");
    }
    try {
        const event = stripe_service_1.stripeService.constructWebhookEvent(req.body, sig);
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                await subscription_service_1.subscriptionService.handleStripeSubscriptionUpdated(event);
                break;
            case "invoice.payment_succeeded":
            case "invoice.payment_failed":
            case "invoice.marked_uncollectible":
                await subscription_service_1.subscriptionService.handleInvoiceEvent(event);
                break;
            default:
                break;
        }
        res.json({ received: true });
    }
    catch (err) {
        next(err);
    }
}
