export function KPI({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-900 p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

