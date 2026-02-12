import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { SubscriptionStatus } from "@prisma/client";

type RequiredPlan = "free" | "pro" | "enterprise";

const PLAN_ORDER: RequiredPlan[] = ["free", "pro", "enterprise"];

export function requirePlan(minPlan: RequiredPlan) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ctx = req.authContext;
    if (!ctx) {
      return res
        .status(500)
        .json({ success: false, message: "Organization context not loaded" });
    }

    const sub = await prisma.subscription.findFirst({
      where: { organizationId: ctx.orgId, deletedAt: null }
    });

    if (!sub) {
      // No subscription means effectively "free"
      if (minPlan === "free") return next();
      return res.status(402).json({
        success: false,
        message: "Upgrade required"
      });
    }

    const currentIndex = PLAN_ORDER.indexOf(sub.planId as RequiredPlan);
    const requiredIndex = PLAN_ORDER.indexOf(minPlan);

    const isActive =
      sub.status === SubscriptionStatus.ACTIVE ||
      sub.status === SubscriptionStatus.TRIALING;

    if (!isActive || currentIndex < requiredIndex) {
      return res.status(402).json({
        success: false,
        message: "Subscription inactive or insufficient plan"
      });
    }

    return next();
  };
}

