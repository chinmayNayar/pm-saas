"use client";

import { useEffect, useState } from "react";
import { axiosClient } from "../../lib/axiosClient";
import { useOrgStore } from "../../store/orgStore";
import { KPI } from "../../components/analytics/kpi-card";
import { LineChart } from "../../components/analytics/line-chart";

export default function DashboardPage() {
  const { currentOrg } = useOrgStore();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrg) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axiosClient
      .get("/analytics/dashboard", { headers: { "x-org-id": currentOrg.id } })
      .then((res) => setData(res.data?.data ?? res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [currentOrg]);

  if (loading) return <div className="text-slate-400">Loading analytics...</div>;
  if (!currentOrg)
    return (
      <div className="rounded-lg bg-slate-900 p-6 text-slate-400">
        Select an organization above to see analytics, or create one in the backend.
      </div>
    );
  if (!data)
    return (
      <div className="rounded-lg bg-slate-900 p-6 text-slate-400">
        No analytics data yet. Create boards and tasks to see metrics.
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <KPI label="Total Tasks" value={data.overview?.totalTasks ?? 0} />
        <KPI label="Completed" value={data.overview?.completedTasks ?? 0} />
        <KPI label="Overdue" value={data.overview?.overdueTasks ?? 0} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <LineChart data={data.completionChart ?? []} title="Task Completion (30d)" />
        <LineChart data={data.monthlyUsage ?? []} title="Monthly Usage (12m)" />
      </div>
    </div>
  );
}

