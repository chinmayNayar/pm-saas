"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePlan = requirePlan;
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
const PLAN_ORDER = ["free", "pro", "enterprise"];
function requirePlan(minPlan) {
    return async (req, res, next) => {
        const ctx = req.authContext;
        if (!ctx) {
            return res
                .status(500)
                .json({ success: false, message: "Organization context not loaded" });
        }
        const sub = await database_1.prisma.subscription.findFirst({
            where: { organizationId: ctx.orgId, deletedAt: null }
        });
        if (!sub) {
            // No subscription means effectively "free"
            if (minPlan === "free")
                return next();
            return res.status(402).json({
                success: false,
                message: "Upgrade required"
            });
        }
        const currentIndex = PLAN_ORDER.indexOf(sub.planId);
        const requiredIndex = PLAN_ORDER.indexOf(minPlan);
        const isActive = sub.status === client_1.SubscriptionStatus.ACTIVE ||
            sub.status === client_1.SubscriptionStatus.TRIALING;
        if (!isActive || currentIndex < requiredIndex) {
            return res.status(402).json({
                success: false,
                message: "Subscription inactive or insufficient plan"
            });
        }
        return next();
    };
}
