import { prisma } from "../config/database";
import { cacheService } from "./cache.service";
import { AuthContext } from "./activity.service";

const ANALYTICS_TTL_SECONDS = 60; // cache for 1 minute

export type TaskOverview = {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
};

export type ProductivityMetrics = {
  tasksCreatedLast7Days: number;
  tasksCompletedLast7Days: number;
  completionRateLast7Days: number; // 0-1
};

export type CompletionChartPoint = {
  date: string; // YYYY-MM-DD
  completed: number;
};

export type MonthlyUsagePoint = {
  month: string; // YYYY-MM-01
  tasksCreated: number;
  tasksCompleted: number;
};

export type DashboardAnalytics = {
  overview: TaskOverview;
  productivity: ProductivityMetrics;
  completionChart: CompletionChartPoint[];
  monthlyUsage: MonthlyUsagePoint[];
};

export class AnalyticsService {
  private cacheKey(orgId: string) {
    return `analytics:dashboard:org:${orgId}`;
  }

  async getDashboardAnalytics(ctx: AuthContext): Promise<DashboardAnalytics> {
    const key = this.cacheKey(ctx.orgId);
    const cached = await cacheService.get<DashboardAnalytics>(key);
    if (cached) return cached;

    const [overview, productivity, completionChart, monthlyUsage] =
      await Promise.all([
        this.computeOverview(ctx),
        this.computeProductivity(ctx),
        this.computeCompletionChart(ctx),
        this.computeMonthlyUsage(ctx)
      ]);

    const result: DashboardAnalytics = {
      overview,
      productivity,
      completionChart,
      monthlyUsage
    };

    await cacheService.set(key, result, ANALYTICS_TTL_SECONDS);
    return result;
  }

  private async computeOverview(ctx: AuthContext): Promise<TaskOverview> {
    const orgId = ctx.orgId;

    // total tasks, completed tasks, overdue tasks
    const [totals] = await prisma.$queryRaw<
      { total: bigint; completed: bigint; overdue: bigint }[]
    >`
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

  private async computeProductivity(ctx: AuthContext): Promise<ProductivityMetrics> {
    const orgId = ctx.orgId;

    const [row] = await prisma.$queryRaw<
      {
        created_last_7: bigint;
        completed_last_7: bigint;
      }[]
    >`
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

    const completionRate =
      created === 0 ? 0 : Math.min(1, completed / created);

    return {
      tasksCreatedLast7Days: created,
      tasksCompletedLast7Days: completed,
      completionRateLast7Days: completionRate
    };
  }

  private async computeCompletionChart(
    ctx: AuthContext
  ): Promise<CompletionChartPoint[]> {
    const orgId = ctx.orgId;

    const rows = await prisma.$queryRaw<
      {
        day: Date;
        completed: bigint;
      }[]
    >`
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

  private async computeMonthlyUsage(
    ctx: AuthContext
  ): Promise<MonthlyUsagePoint[]> {
    const orgId = ctx.orgId;

    const rows = await prisma.$queryRaw<
      {
        month: Date;
        created: bigint;
        completed: bigint;
      }[]
    >`
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

export const analyticsService = new AnalyticsService();

