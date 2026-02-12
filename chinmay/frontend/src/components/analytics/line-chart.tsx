type Point = {
  date?: string;
  month?: string;
  completed?: number;
  tasksCreated?: number;
  tasksCompleted?: number;
};

export function LineChart({ data, title }: { data: Point[]; title: string }) {
  return (
    <div className="rounded-lg bg-slate-900 p-4">
      <div className="mb-2 text-sm font-semibold">{title}</div>
      <div className="text-xs text-slate-400 space-y-1 max-h-40 overflow-y-auto">
        {data.length === 0 ? (
          <div>No data</div>
        ) : (
          data.map((p, idx) => (
            <div key={idx} className="flex justify-between gap-2">
              <span>{p.date ?? p.month ?? "—"}</span>
              <span>
                {p.completed !== undefined && `Completed: ${p.completed}`}
                {p.tasksCreated !== undefined && ` Created: ${p.tasksCreated}`}
                {p.tasksCompleted !== undefined && ` Done: ${p.tasksCompleted}`}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

