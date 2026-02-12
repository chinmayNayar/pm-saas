"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.AnalyticsService = void 0;
const database_1 = require("../config/database");
const cache_service_1 = require("./cache.service");
const ANALYTICS_TTL_SECONDS = 60; // cache for 1 minute
class AnalyticsService {
    cacheKey(orgId) {
        return `analytics:dashboard:org:${orgId}`;
    }
    async getDashboardAnalytics(ctx) {
        const key = this.cacheKey(ctx.orgId);
        const cached = await cache_service_1.cacheService.get(key);
        if (cached)
            return cached;
        const [overview, productivity, completionChart, monthlyUsage] = await Promise.all([
            this.computeOverview(ctx),
            this.computeProductivity(ctx),
            this.computeCompletionChart(ctx),
            this.computeMonthlyUsage(ctx)
        ]);
        const result = {
            overview,
            productivity,
            completionChart,
            monthlyUsage
        };
        await cache_service_1.cacheService.set(key, result, ANALYTICS_TTL_SECONDS);
        return result;
    }
    async computeOverview(ctx) {
        const orgId = ctx.orgId;
        // total tasks, completed tasks, overdue tasks
        const [totals] = await database_1.prisma.$queryRaw `
      SELECT
        COUNT(*)::bigint AS total,
        COUNT(*) FILTER (WHERE "status" = 'DONE')::bigint AS completed,
        COUNT(*) FILTER (
          WHERE "status" <> 'DONE'
            AND "dueDate" IS NOT NULL
            AND "dueDate" < NOW()
        )::bigint AS overdue
      FROM "Task"
      WHERE "organizationId" = ${orgId} AND "deletedAt" IS NULL
    `;
        return {
            totalTasks: Number(totals?.total ?? 0),
            completedTasks: Number(totals?.completed ?? 0),
            overdueTasks: Number(totals?.overdue ?? 0)
        };
    }
    async computeProductivity(ctx) {
        const orgId = ctx.orgId;
        const [row] = await database_1.prisma.$queryRaw `
      SELECT
        COUNT(*) FILTER (
          WHERE "createdAt" >= NOW() - interval '7 days'
        )::bigint AS created_last_7,
        COUNT(*) FILTER (
          WHERE "status" = 'DONE'
            AND "updatedAt" >= NOW() - interval '7 days'
        )::bigint AS completed_last_7
      FROM "Task"
      WHERE "organizationId" = ${orgId} AND "deletedAt" IS NULL
    `;
        const created = Number(row?.created_last_7 ?? 0);
        const completed = Number(row?.completed_last_7 ?? 0);
        const completionRate = created === 0 ? 0 : Math.min(1, completed / created);
        return {
            tasksCreatedLast7Days: created,
            tasksCompletedLast7Days: completed,
            completionRateLast7Days: completionRate
        };
    }
    async computeCompletionChart(ctx) {
        const orgId = ctx.orgId;
        const rows = await database_1.prisma.$queryRaw `
      SELECT
        date_trunc('day', "updatedAt")::date AS day,
        COUNT(*)::bigint AS completed
      FROM "Task"
      WHERE "organizationId" = ${orgId}
        AND "deletedAt" IS NULL
        AND "status" = 'DONE'
        AND "updatedAt" >= NOW() - interval '30 days'
      GROUP BY day
      ORDER BY day
    `;
        return rows.map((r) => ({
            date: r.day.toISOString().slice(0, 10),
            completed: Number(r.completed)
        }));
    }
    async computeMonthlyUsage(ctx) {
        const orgId = ctx.orgId;
        const rows = await database_1.prisma.$queryRaw `
      SELECT
        date_trunc('month', "createdAt")::date AS month,
        COUNT(*)::bigint AS created,
        COUNT(*) FILTER (WHERE "status" = 'DONE')::bigint AS completed
      FROM "Task"
      WHERE "organizationId" = ${orgId}
        AND "deletedAt" IS NULL
        AND "createdAt" >= NOW() - interval '12 months'
      GROUP BY month
      ORDER BY month
    `;
        return rows.map((r) => ({
            month: r.month.toISOString().slice(0, 10), // first day of month
            tasksCreated: Number(r.created),
            tasksCompleted: Number(r.completed)
        }));
    }
}
exports.AnalyticsService = AnalyticsService;
exports.analyticsService = new AnalyticsService();
