"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionService = exports.SubscriptionService = void 0;
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
const stripe_service_1 = require("./stripe.service");
class SubscriptionService {
    async getOrCreateCustomerForOrg(orgId) {
        let subscription = await database_1.prisma.subscription.findFirst({
            where: { organizationId: orgId, deletedAt: null }
        });
        if (subscription?.stripeCustomerId) {
            return subscription.stripeCustomerId;
        }
        const org = await database_1.prisma.organization.findUnique({ where: { id: orgId } });
        if (!org)
            throw new Error("Organization not found");
        const owner = await database_1.prisma.user.findUnique({ where: { id: org.ownerId } });
        if (!owner)
            throw new Error("Owner not found");
        const customer = await stripe_service_1.stripeService.createCustomer(owner.email, org.name);
        if (!subscription) {
            subscription = await database_1.prisma.subscription.create({
                data: {
                    organizationId: orgId,
                    planId: "free",
                    status: client_1.SubscriptionStatus.TRIALING,
                    stripeCustomerId: customer.id
                }
            });
        }
        else {
            await database_1.prisma.subscription.update({
                where: { id: subscription.id },
                data: { stripeCustomerId: customer.id }
            });
        }
        return customer.id;
    }
    async createCheckoutSessionForOrg(params) {
        const customerId = await this.getOrCreateCustomerForOrg(params.orgId);
        return stripe_service_1.stripeService.createCheckoutSession({
            customerId,
            planId: params.planId,
            successUrl: params.successUrl,
            cancelUrl: params.cancelUrl,
            orgId: params.orgId
        });
    }
    // Called from webhook when subscription events fire
    async handleStripeSubscriptionUpdated(event) {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const stripeSubId = subscription.id;
        const dbSub = await database_1.prisma.subscription.findFirst({
            where: { stripeCustomerId: customerId, deletedAt: null }
        });
        if (!dbSub) {
            // we can also resolve org via metadata if needed
            return;
        }
        const statusMap = {
            trialing: client_1.SubscriptionStatus.TRIALING,
            active: client_1.SubscriptionStatus.ACTIVE,
            past_due: client_1.SubscriptionStatus.PAST_DUE,
            canceled: client_1.SubscriptionStatus.CANCELED,
            incomplete: client_1.SubscriptionStatus.INCOMPLETE,
            incomplete_expired: client_1.SubscriptionStatus.INCOMPLETE_EXPIRED,
            unpaid: client_1.SubscriptionStatus.UNPAID
        };
        const mappedStatus = statusMap[subscription.status] ?? client_1.SubscriptionStatus.INCOMPLETE;
        await database_1.prisma.subscription.update({
            where: { id: dbSub.id },
            data: {
                stripeSubscriptionId: stripeSubId,
                status: mappedStatus,
                currentPeriodStart: subscription.current_period_start
                    ? new Date(subscription.current_period_start * 1000)
                    : dbSub.currentPeriodStart,
                currentPeriodEnd: subscription.current_period_end
                    ? new Date(subscription.current_period_end * 1000)
                    : dbSub.currentPeriodEnd,
                cancelAtPeriodEnd: subscription.cancel_at_period_end ?? dbSub.cancelAtPeriodEnd
            }
        });
    }
    // Called from webhook when invoice / payment events fire
    async handleInvoiceEvent(event) {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const dbSub = await database_1.prisma.subscription.findFirst({
            where: { stripeCustomerId: customerId, deletedAt: null },
            include: { organization: true }
        });
        if (!dbSub)
            return;
        const amountCents = invoice.amount_paid ?? invoice.amount_due ?? 0;
        const currency = invoice.currency ?? "usd";
        const invoiceId = invoice.id;
        const paymentIntentId = invoice.payment_intent;
        const status = invoice.status; // "paid", "open", "uncollectible" etc.
        await database_1.prisma.payment.upsert({
            where: { stripeInvoiceId: invoiceId },
            create: {
                organizationId: dbSub.organizationId,
                subscriptionId: dbSub.id,
                amountCents,
                currency,
                status,
                stripeInvoiceId: invoiceId,
                stripePaymentIntentId: paymentIntentId,
                metadata: invoice
            },
            update: {
                amountCents,
                currency,
                status,
                stripePaymentIntentId: paymentIntentId,
                metadata: invoice
            }
        });
        // For failed or uncollectible payments, mark sub as PAST_DUE
        if (status === "open" || status === "uncollectible") {
            await database_1.prisma.subscription.update({
                where: { id: dbSub.id },
                data: { status: client_1.SubscriptionStatus.PAST_DUE }
            });
        }
    }
}
exports.SubscriptionService = SubscriptionService;
exports.subscriptionService = new SubscriptionService();
