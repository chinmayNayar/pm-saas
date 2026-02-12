import { prisma } from "../config/database";
import { SubscriptionStatus } from "@prisma/client";
import { PLAN_PRICE_MAP, PlanId, stripeService } from "./stripe.service";
import { env } from "../config/env";

export class SubscriptionService {
  async getOrCreateCustomerForOrg(orgId: string) {
    let subscription = await prisma.subscription.findFirst({
      where: { organizationId: orgId, deletedAt: null }
    });

    if (subscription?.stripeCustomerId) {
      return subscription.stripeCustomerId;
    }

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error("Organization not found");

    const owner = await prisma.user.findUnique({ where: { id: org.ownerId } });
    if (!owner) throw new Error("Owner not found");

    const customer = await stripeService.createCustomer(owner.email, org.name);

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          organizationId: orgId,
          planId: "free",
          status: SubscriptionStatus.TRIALING,
          stripeCustomerId: customer.id
        }
      });
    } else {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { stripeCustomerId: customer.id }
      });
    }

    return customer.id;
  }

  async createCheckoutSessionForOrg(params: {
    orgId: string;
    planId: PlanId;
    successUrl: string;
    cancelUrl: string;
  }) {
    const customerId = await this.getOrCreateCustomerForOrg(params.orgId);
    return stripeService.createCheckoutSession({
      customerId,
      planId: params.planId,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
      orgId: params.orgId
    });
  }

  // Called from webhook when subscription events fire
  async handleStripeSubscriptionUpdated(event: any) {
    const subscription = event.data.object as {
      id: string;
      status: string;
      customer: string;
      metadata?: Record<string, any>;
      current_period_start?: number;
      current_period_end?: number;
      cancel_at_period_end?: boolean;
    };

    const customerId = subscription.customer as string;
    const stripeSubId = subscription.id;

    const dbSub = await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId, deletedAt: null }
    });
    if (!dbSub) {
      // we can also resolve org via metadata if needed
      return;
    }

    const statusMap: Record<string, SubscriptionStatus> = {
      trialing: SubscriptionStatus.TRIALING,
      active: SubscriptionStatus.ACTIVE,
      past_due: SubscriptionStatus.PAST_DUE,
      canceled: SubscriptionStatus.CANCELED,
      incomplete: SubscriptionStatus.INCOMPLETE,
      incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
      unpaid: SubscriptionStatus.UNPAID
    };

    const mappedStatus =
      statusMap[subscription.status] ?? SubscriptionStatus.INCOMPLETE;

    await prisma.subscription.update({
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
        cancelAtPeriodEnd:
          subscription.cancel_at_period_end ?? dbSub.cancelAtPeriodEnd
      }
    });
  }

  // Called from webhook when invoice / payment events fire
  async handleInvoiceEvent(event: any) {
    const invoice = event.data.object as any;
    const customerId = invoice.customer as string;

    const dbSub = await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId, deletedAt: null },
      include: { organization: true }
    });
    if (!dbSub) return;

    const amountCents = invoice.amount_paid ?? invoice.amount_due ?? 0;
    const currency = invoice.currency ?? "usd";
    const invoiceId = invoice.id as string;
    const paymentIntentId = invoice.payment_intent as string | undefined;

    const status = invoice.status as string; // "paid", "open", "uncollectible" etc.

    await prisma.payment.upsert({
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
      await prisma.subscription.update({
        where: { id: dbSub.id },
        data: { status: SubscriptionStatus.PAST_DUE }
      });
    }
  }
}

export const subscriptionService = new SubscriptionService();

