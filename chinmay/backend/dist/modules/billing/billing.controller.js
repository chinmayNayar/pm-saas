"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingController = void 0;
const subscription_service_1 = require("../../services/subscription.service");
const apiResponse_1 = require("../../utils/apiResponse");
class BillingController {
    async createCheckoutSession(req, res, next) {
        try {
            const ctx = req.authContext;
            const { planId, successUrl, cancelUrl } = req.body;
            const session = await subscription_service_1.subscriptionService.createCheckoutSessionForOrg({
                orgId: ctx.orgId,
                planId,
                successUrl,
                cancelUrl
            });
            return (0, apiResponse_1.ok)(res, { url: session.url }, "Checkout session created");
        }
        catch (err) {
            next(err);
        }
    }
}
exports.billingController = new BillingController();
